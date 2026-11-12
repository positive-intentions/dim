import { keyed, setSkipFocusRestore } from "./mini-lit.js";
import { viewTransitionStyles } from "./view-transitions.js";

/**
 * Walk a root (and any nested shadow roots) collecting matching elements.
 */
function queryDeep(root, selector) {
  const found = [];
  const visit = (node) => {
    if (!node?.querySelectorAll) return;
    node.querySelectorAll(selector).forEach((el) => found.push(el));
    node.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) visit(el.shadowRoot);
    });
  };
  visit(root);
  return found;
}

/**
 * Manages auto view-transition rendering (two-layer slide), shared-element
 * FLIP, and wrapper height animation for a DimComponent host.
 */
export class AutoTransitionHost {
  constructor(host) {
    this.host = host;
    this._previousRenderResult = null;
    this._sharedRects = null;
    this._flipTransitionKey = null;
    this._flipPlayed = false;
    this._isTransitioningNow = false;
    this._flipDuration = 500;
    this._flipEasing = "cubic-bezier(0.4, 0, 0.2, 1)";
    this._sharedOverlayContainer = null;
    this._wrapperHeights = null;
    this._containerResizePlayed = false;
    this._wrapperHeightAnimation = null;
  }

  /**
   * Build the template for an auto-transition component render.
   * @param {object} autoTransition
   * @param {*} result
   * @param {Function} html - Dim html tagged template (same as public export)
   */
  wrapRender(autoTransition, result, html) {
    const transitionStyles = autoTransition.getTransitionStyles();
    const styleString = Object.entries(transitionStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");

    const styleText = `${viewTransitionStyles}
        .auto-transition-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }`;

    const wrapperStyles = html`
      <style>
        ${styleText}
      </style>
    `;

    const hasPrevious =
      this._previousRenderResult !== null &&
      this._previousRenderResult !== undefined;

    if (autoTransition.isTransitioning && hasPrevious) {
      const incomingClass = autoTransition.getIncomingClass("vt-layer");
      const outgoingClass = autoTransition.getOutgoingClass("vt-layer");
      const previousResult = this._previousRenderResult;

      // Two-layer commit: don't restore focus onto outgoing clones
      setSkipFocusRestore(true);

      this._isTransitioningNow = true;
      this._flipDuration = autoTransition.options?.duration ?? 500;
      this._flipEasing =
        autoTransition.options?.easing ?? "cubic-bezier(0.4, 0, 0.2, 1)";
      const flipKey = `${autoTransition.previousId}=>${autoTransition.currentId}`;
      if (this._flipTransitionKey !== flipKey) {
        this._flipTransitionKey = flipKey;
        this._sharedRects = this._captureSharedRects();
        this._flipPlayed = false;
        const wrapperEl = this.host.shadowRoot?.querySelector(
          ".auto-transition-wrapper"
        );
        this._wrapperHeights = {
          old: wrapperEl ? wrapperEl.offsetHeight : 0,
        };
        this._containerResizePlayed = false;
      }

      return html`
        ${wrapperStyles}
        <div class="auto-transition-wrapper view-transition-container">
          <div class="${incomingClass} vt-incoming" style="${styleString}">
            ${keyed(autoTransition.currentId, result)}
          </div>
          <div class="${outgoingClass}" style="${styleString}">
            ${keyed(autoTransition.previousId, previousResult)}
          </div>
        </div>
      `;
    }

    setSkipFocusRestore(false);
    this._isTransitioningNow = false;
    this.cleanupTransitionEffects();
    this._previousRenderResult = result;
    return html`
      ${wrapperStyles}
      <div class="auto-transition-wrapper view-transition-container">
        <div class="view-transition-item" style="${styleString}">
          ${result}
        </div>
      </div>
    `;
  }

  cacheRenderResult(result) {
    this._isTransitioningNow = false;
    this._previousRenderResult = result;
  }

  onUpdated() {
    if (
      this._isTransitioningNow &&
      this._wrapperHeights &&
      !this._containerResizePlayed
    ) {
      this._containerResizePlayed = true;
      this._runContainerHeightTransition(this._flipDuration, this._flipEasing);
    }
    if (
      this._isTransitioningNow &&
      this._sharedRects &&
      Object.keys(this._sharedRects).length > 0 &&
      !this._flipPlayed
    ) {
      const runFlip = () => {
        if (!this._isTransitioningNow || this._flipPlayed) return false;
        const incomingLayer = this.host.shadowRoot?.querySelector(
          ".vt-layer.vt-incoming"
        );
        if (!incomingLayer) return false;
        const hasTargets = queryDeep(incomingLayer, "[data-vt-shared]").some(
          (el) => this._sharedRects[el.getAttribute("data-vt-shared")]
        );
        if (!hasTargets) return false;
        this._flipPlayed = true;
        this._runSharedElementFlip(this._flipDuration, this._flipEasing);
        return true;
      };

      if (!runFlip()) {
        // Nested child components may not have painted their shadow DOM yet.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => runFlip());
        });
      }
    }
  }

  cleanupTransitionEffects() {
    if (this._wrapperHeightAnimation?.cancel) {
      this._wrapperHeightAnimation.cancel();
    }
    this._wrapperHeightAnimation = null;
    const root = this.host.shadowRoot;
    if (root) {
      const wrapper = root.querySelector(".auto-transition-wrapper");
      if (wrapper) {
        wrapper.classList.remove("vt-resizing");
        wrapper.style.height = "";
      }
      queryDeep(root, ".vt-shared-hidden").forEach((el) => {
        el.classList.remove("vt-shared-hidden");
        // Inline visibility is used so nested-shadow shared nodes hide even
        // when the host's .vt-shared-hidden stylesheet does not apply.
        el.style.visibility = "";
      });
    }
    if (this._sharedOverlayContainer) {
      this._sharedOverlayContainer.innerHTML = "";
    }
    this._sharedRects = null;
    this._flipTransitionKey = null;
    this._flipPlayed = false;
    this._wrapperHeights = null;
    this._containerResizePlayed = false;
  }

  disconnect() {
    this.cleanupTransitionEffects();
    if (this._sharedOverlayContainer) {
      this._sharedOverlayContainer.remove();
      this._sharedOverlayContainer = null;
    }
  }

  _applyFlipVisualStyles(source, clone) {
    const cs = getComputedStyle(source);
    clone.style.textAlign = cs.textAlign;
    clone.style.boxSizing = cs.boxSizing;
    clone.style.font = cs.font;
    clone.style.lineHeight = cs.lineHeight;
    clone.style.letterSpacing = cs.letterSpacing;
    clone.style.padding = cs.padding;
    clone.style.border = cs.border;
    clone.style.borderRadius = cs.borderRadius;
    clone.style.background = cs.background;
    clone.style.boxShadow = cs.boxShadow;
    clone.style.color = cs.color;
    clone.style.fontSize = cs.fontSize;
    clone.style.fontWeight = cs.fontWeight;
    clone.style.whiteSpace = cs.whiteSpace;
    clone.style.overflow = cs.overflow;
    clone.style.textOverflow = cs.textOverflow;
    // Clone is lifted into the host overlay and loses child-shadow CSS
    // (e.g. .product-image { display:flex; align-items:center }). Copy layout
    // so centered content does not jump to the top-left during FLIP.
    clone.style.display = cs.display;
    clone.style.alignItems = cs.alignItems;
    clone.style.justifyContent = cs.justifyContent;
    clone.style.alignContent = cs.alignContent;
    clone.style.flexDirection = cs.flexDirection;
    clone.style.flexWrap = cs.flexWrap;
    clone.style.gap = cs.gap;
    if (cs.rowGap) clone.style.rowGap = cs.rowGap;
    if (cs.columnGap) clone.style.columnGap = cs.columnGap;
    if (source instanceof HTMLImageElement) {
      clone.style.objectFit = cs.objectFit || "cover";
      clone.style.objectPosition = cs.objectPosition || "center";
    }
  }

  _captureSharedRects() {
    const root = this.host.shadowRoot;
    if (!root) return {};
    const wrapper = root.querySelector(".auto-transition-wrapper");
    const wrapperRect = wrapper
      ? wrapper.getBoundingClientRect()
      : { left: 0, top: 0 };
    const rects = {};
    queryDeep(root, "[data-vt-shared]").forEach((el) => {
      const key = el.getAttribute("data-vt-shared");
      const r = el.getBoundingClientRect();
      rects[key] = {
        left: r.left - wrapperRect.left,
        top: r.top - wrapperRect.top,
        width: r.width,
        height: r.height,
      };
    });
    return rects;
  }

  _runContainerHeightTransition(duration, easing) {
    const root = this.host.shadowRoot;
    if (!root) return;
    const wrapper = root.querySelector(".auto-transition-wrapper");
    const incomingLayer = root.querySelector(".vt-layer.vt-incoming");
    if (!wrapper || !incomingLayer || !this._wrapperHeights) return;

    const oldHeight = this._wrapperHeights.old;

    const prevAnim = incomingLayer.style.animation;
    const prevTransform = incomingLayer.style.transform;
    incomingLayer.style.animation = "none";
    incomingLayer.style.transform = "none";
    const newHeight = incomingLayer.offsetHeight;
    incomingLayer.style.animation = prevAnim;
    incomingLayer.style.transform = prevTransform;

    this._wrapperHeights.new = newHeight;

    if (oldHeight === newHeight) return;

    wrapper.classList.add("vt-resizing");
    wrapper.style.height = `${oldHeight}px`;
    void wrapper.offsetHeight;

    if (typeof wrapper.animate === "function") {
      this._wrapperHeightAnimation = wrapper.animate(
        [{ height: `${oldHeight}px` }, { height: `${newHeight}px` }],
        { duration, easing, fill: "both" }
      );
    }
  }

  _runSharedElementFlip(duration, easing) {
    const root = this.host.shadowRoot;
    if (!root) return;
    const wrapper = root.querySelector(".auto-transition-wrapper");
    const incomingLayer = root.querySelector(".vt-layer.vt-incoming");
    if (!wrapper || !incomingLayer) return;
    const outgoingLayer = root.querySelector(".vt-layer:not(.vt-incoming)");

    if (
      !this._sharedOverlayContainer ||
      !this._sharedOverlayContainer.isConnected
    ) {
      this._sharedOverlayContainer = document.createElement("div");
      this._sharedOverlayContainer.className = "vt-shared-overlays";
      wrapper.appendChild(this._sharedOverlayContainer);
    }
    const container = this._sharedOverlayContainer;
    container.innerHTML = "";

    const oldRects = this._sharedRects || {};

    const prevAnim = incomingLayer.style.animation;
    const prevTransform = incomingLayer.style.transform;
    incomingLayer.style.animation = "none";
    incomingLayer.style.transform = "none";

    const wrapperRect = wrapper.getBoundingClientRect();

    queryDeep(incomingLayer, "[data-vt-shared]").forEach((el) => {
      const key = el.getAttribute("data-vt-shared");
      const oldRect = oldRects[key];
      if (!oldRect) return;

      const r = el.getBoundingClientRect();
      const newRect = {
        left: r.left - wrapperRect.left,
        top: r.top - wrapperRect.top,
        width: r.width,
        height: r.height,
      };

      const clone = el.cloneNode(true);
      clone.classList.add("vt-shared-overlay");
      clone.classList.remove("vt-shared-hidden");
      clone.removeAttribute("data-vt-shared-internal");
      this._applyFlipVisualStyles(el, clone);
      clone.style.left = `${newRect.left}px`;
      clone.style.top = `${newRect.top}px`;
      clone.style.width = `${newRect.width}px`;
      clone.style.height = `${newRect.height}px`;
      // Center-to-center invert so full-width centered titles travel from the
      // details midpoint to the card (top-left invert has ~0 horizontal delta).
      clone.style.transformOrigin = "center center";

      const dx =
        oldRect.left +
        oldRect.width / 2 -
        (newRect.left + newRect.width / 2);
      const dy =
        oldRect.top +
        oldRect.height / 2 -
        (newRect.top + newRect.height / 2);
      // Uniform scale from height so full-width block text (and images) do not
      // stretch anamorphically when old/new aspect ratios differ (esp. back-nav).
      const sx = newRect.width > 0 ? oldRect.width / newRect.width : 1;
      const sy = newRect.height > 0 ? oldRect.height / newRect.height : 1;
      const s = newRect.height > 0 ? sy : sx;
      const initialTransform = `translate(${dx}px, ${dy}px) scale(${s})`;
      clone.style.transform = initialTransform;
      container.appendChild(clone);
      void clone.offsetWidth;

      // Class for same-shadow hosts; inline visibility for nested shadows
      // where the host's .vt-shared-hidden rule does not apply.
      el.classList.add("vt-shared-hidden");
      el.style.visibility = "hidden";
      const outCopy =
        outgoingLayer &&
        queryDeep(outgoingLayer, `[data-vt-shared="${key}"]`)[0];
      if (outCopy) {
        outCopy.classList.add("vt-shared-hidden");
        outCopy.style.visibility = "hidden";
      }

      if (typeof clone.animate === "function") {
        clone.animate(
          [
            { transform: initialTransform },
            { transform: "translate(0px, 0px) scale(1)" },
          ],
          { duration, easing, fill: "both" }
        );
      }
    });

    incomingLayer.style.animation = prevAnim;
    incomingLayer.style.transform = prevTransform;
  }
}
