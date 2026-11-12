/**
 * DimElement — custom-element host. Hosts a shadow root, runs `render()`,
 * and flushes `useStyle` queues after each commit.
 */

import { html, render } from "../renderer/index.js";
import { setSkipFocusRestore } from "../renderer/focus.js";

export class DimElement extends HTMLElement {
  constructor() {
    super();
    this.__controllers = [];
    this.__updatePromise = null;
    this.__hasRequestedUpdate = false;
    this.__isConnected = false;
    this.__hasRendered = false;
    this._props = undefined;
    /** @type {ShadowRoot|null} */
    this.renderRoot = null;
  }

  /**
   * Reactive `.props` property. Assigning triggers update.
   */
  get props() {
    return this._props;
  }
  set props(value) {
    const prev = this._props;
    this._props = value;
    if (!Object.is(prev, value)) {
      this.requestUpdate();
    }
  }

  createRenderRoot() {
    return this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.__isConnected = true;
    if (!this.renderRoot) {
      this.renderRoot = this.createRenderRoot();
    }
    this.requestUpdate();
    for (const c of this.__controllers) {
      c.hostConnected?.();
    }
  }

  disconnectedCallback() {
    this.__isConnected = false;
    for (const c of this.__controllers) {
      c.hostDisconnected?.();
    }
  }

  addController(controller) {
    this.__controllers.push(controller);
    if (this.__isConnected) {
      controller.hostConnected?.();
    }
  }

  removeController(controller) {
    const i = this.__controllers.indexOf(controller);
    if (i >= 0) this.__controllers.splice(i, 1);
  }

  requestUpdate() {
    if (this.__hasRequestedUpdate) {
      return this.__updatePromise;
    }
    this.__hasRequestedUpdate = true;
    this.__updatePromise = Promise.resolve().then(() => this.__doUpdate());
    return this.__updatePromise;
  }

  get updateComplete() {
    return this.__updatePromise || Promise.resolve(true);
  }

  async __doUpdate() {
    this.__hasRequestedUpdate = false;
    if (!this.renderRoot) {
      this.renderRoot = this.createRenderRoot();
    }
    for (const c of this.__controllers) {
      c.hostUpdate?.();
    }
    // Reset style queue; useStyle pushes entries during render()
    this.__styleQueue = [];
    try {
      const result = this.render();
      render(result, this.renderRoot, { preserveFocus: true });
      // Apply styles after commit so they aren't wiped by the first render clear
      this.__flushStyles();
      this.__hasRendered = true;
      for (const c of this.__controllers) {
        c.hostUpdated?.();
      }
      this.updated();
    } finally {
      // Clear transition-time focus skip after each commit
      setSkipFocusRestore(false);
    }
    return true;
  }

  __flushStyles() {
    const queue = this.__styleQueue;
    if (!queue || !queue.length) return;
    const root = this.shadowRoot || this.renderRoot;
    if (!root) return;
    // Remember adopted sheets per hook so later cssText changes can
    // replaceSync instead of leaving a stale sheet + a competing <style>.
    this.__adoptedSheets = this.__adoptedSheets || {};
    for (const entry of queue) {
      const { hookName, cssText, cssResult, preferAdopted } = entry;
      const existingAdopted = this.__adoptedSheets[hookName];
      if (existingAdopted) {
        try {
          existingAdopted.replaceSync(cssText);
        } catch {
          // Fall through to a style tag if replaceSync is unavailable.
          let styleElement = root.querySelector(
            `[data-style-hook="${hookName}"]`
          );
          if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.setAttribute("data-style-hook", hookName);
            root.appendChild(styleElement);
          }
          styleElement.textContent = cssText;
        }
        continue;
      }

      let styleElement = root.querySelector(
        `[data-style-hook="${hookName}"]`
      );
      if (!styleElement) {
        if (
          preferAdopted &&
          root.adoptedStyleSheets !== undefined &&
          cssResult?.styleSheet
        ) {
          root.adoptedStyleSheets = [
            ...root.adoptedStyleSheets,
            cssResult.styleSheet,
          ];
          this.__adoptedSheets[hookName] = cssResult.styleSheet;
          continue;
        }
        styleElement = document.createElement("style");
        styleElement.setAttribute("data-style-hook", hookName);
        root.appendChild(styleElement);
      }
      if (styleElement) {
        styleElement.textContent = cssText;
      }
    }
    this.__styleQueue = [];
  }

  /** Override in subclass / DimComponent */
  render() {
    return html``;
  }

  /** Override — called after render commits */
  updated() {}
}
