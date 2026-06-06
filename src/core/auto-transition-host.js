import { keyed } from "../vendor/lit/directives/keyed.js";
import { viewTransitionStyles } from "./view-transitions.js";

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
   * Build the lit template for an auto-transition component render, or null if
   * the caller should use the default (non-wrapped) result path.
   */
  wrapRender(autoTransition, result, litHtml) {
    const transitionStyles = autoTransition.getTransitionStyles();
    const styleString = Object.entries(transitionStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");

    const wrapperStyles = litHtml`
      <style>
        ${viewTransitionStyles}
        .auto-transition-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
      </style>
    `;

    const hasPrevious =
      this._previousRenderResult !== null &&
      this._previousRenderResult !== undefined;

    if (autoTransition.isTransitioning && hasPrevious) {
      const incomingClass = autoTransition.getIncomingClass("vt-layer");
      const outgoingClass = autoTransition.getOutgoingClass("vt-layer");
      const previousResult = this._previousRenderResult;

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

      return litHtml`
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

    this._isTransitioningNow = false;
    this.cleanupTransitionEffects();
    this._previousRenderResult = result;
    return litHtml`
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
      this._flipPlayed = true;
      this._runSharedElementFlip(this._flipDuration, this._flipEasing);
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
      root
        .querySelectorAll(".vt-shared-hidden")
        .forEach((el) => el.classList.remove("vt-shared-hidden"));
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
  }

  _captureSharedRects() {
    const root = this.host.shadowRoot;
    if (!root) return {};
    const wrapper = root.querySelector(".auto-transition-wrapper");
    const wrapperRect = wrapper
      ? wrapper.getBoundingClientRect()
      : { left: 0, top: 0 };
    const rects = {};
    root.querySelectorAll("[data-vt-shared]").forEach((el) => {
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

    incomingLayer.querySelectorAll("[data-vt-shared]").forEach((el) => {
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
      clone.style.transformOrigin = "top left";

      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;
      const sx = newRect.width > 0 ? oldRect.width / newRect.width : 1;
      const sy = newRect.height > 0 ? oldRect.height / newRect.height : 1;
      const initialTransform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      clone.style.transform = initialTransform;
      container.appendChild(clone);
      void clone.offsetWidth;

      el.classList.add("vt-shared-hidden");
      const outCopy =
        outgoingLayer &&
        outgoingLayer.querySelector(`[data-vt-shared="${key}"]`);
      if (outCopy) outCopy.classList.add("vt-shared-hidden");

      if (typeof clone.animate === "function") {
        clone.animate(
          [
            { transform: initialTransform },
            { transform: "translate(0px, 0px) scale(1, 1)" },
          ],
          { duration, easing, fill: "both" }
        );
      }
    });

    incomingLayer.style.animation = prevAnim;
    incomingLayer.style.transform = prevTransform;
  }
}
