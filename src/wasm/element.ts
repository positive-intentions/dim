/**
 * WASM-backed replacement for `src/core/element/*`.
 *
 * `customElements.define` needs a JS class that extends `HTMLElement` (which
 * wasm-bindgen cannot subclass), so these classes stay in JS and forward
 * lifecycle, scheduling, styles and props parsing to Rust.
 */
import "./load";
import * as wasm from "./generated/pkg/dim_core.js";
import { css, html, keyed, renderChildren, unsafeCSS } from "./renderer";
import {
  useEffect,
  useMemo,
  useRef,
  useScope,
  useState,
  useStyle,
} from "./hooks";
import { useStore } from "../core/store/useStore";
import { useViewTransition } from "../core/transitions/useViewTransition.js";
import { AutoTransitionHost } from "../core/transitions/auto-transition-host.js";
import { useFS as _useFS } from "../core/fs/useFS.js";
import { validateProps } from "../core/contracts/contract.js";

export class DimElement extends HTMLElement {
  [key: string]: any;

  constructor() {
    super();
    wasm.hostInit(this);
  }

  /** Reactive `.props` property. Assigning triggers update. */
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
    wasm.hostConnected(this);
  }

  disconnectedCallback() {
    wasm.hostDisconnected(this);
  }

  addController(controller) {
    wasm.addController(this, controller);
  }

  removeController(controller) {
    wasm.removeController(this, controller);
  }

  requestUpdate() {
    return wasm.requestUpdate(this);
  }

  get updateComplete() {
    return this.__updatePromise || Promise.resolve(true);
  }

  __flushStyles() {
    wasm.flushStyles(this);
  }

  /** Override in subclass / DimComponent */
  render() {
    return html``;
  }

  /** Override — called after render commits */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updated(_changedProperties?: any) {}
}

export const parseAttributes = (element) => wasm.parseAttributes(element);
export const readProp = (obj, name) => wasm.readProp(obj, name);

/**
 * Wrap merged attributes + host props in a case-insensitive proxy so
 * components can read camelCase attributes the DOM stores lowercased.
 */
export function createComponentProps(
  attributes,
  hostProps,
  children,
  childElements,
) {
  const rawProps = wasm.mergeProps(
    attributes,
    hostProps,
    children,
    childElements,
  );
  return new Proxy(rawProps, {
    get(target, key) {
      if (typeof key === "string" && !(key in target)) {
        return wasm.readProp(target, key);
      }
      return target[key];
    },
  });
}

/**
 * Register a functional component as a custom element.
 * Stamps `component.tag = tag` and returns the component for useScope({ Comp }).
 */
export function define({
  tag,
  component: CustomFunctionalComponent,
  inputs = null,
}: {
  tag: string;
  component: any;
  inputs?: any;
}) {
  class DimComponent extends DimElement {
    constructor() {
      super();
      this._childNodes = [];
      this._slotContent = null;
      this._childNodesCaptured = false;
      this._attributeObserver = null;
      this._attributeUpdateScheduled = false;
      this._transitionHost = new AutoTransitionHost(this);
    }

    connectedCallback() {
      super.connectedCallback();
      if (!this._childNodesCaptured) {
        this._childNodes = Array.from(this.childNodes);
        this._slotContent = this.innerHTML;
        this._childNodesCaptured = true;
      }

      // Re-render on host attribute changes (plain-attribute APIs).
      if (!this._attributeObserver) {
        this._attributeObserver = new MutationObserver(() => {
          if (!this._attributeUpdateScheduled) {
            this._attributeUpdateScheduled = true;
            requestAnimationFrame(() => {
              this._attributeUpdateScheduled = false;
              this.requestUpdate();
            });
          }
        });
      }
      this._attributeObserver.observe(this, { attributes: true });
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._attributeObserver) {
        this._attributeObserver.disconnect();
      }
      this._attributeUpdateScheduled = false;
      this._transitionHost.disconnect();
    }

    render() {
      wasm.beginRender(this);
      let result;
      let autoTransition = null;
      try {
        const attributes = wasm.parseAttributes(this);

        if (!this._props) this._props = {};
        const hostProps = this._props;

        const transitionId =
          wasm.readProp(attributes, "transitionId") ??
          wasm.readProp(hostProps, "transitionId");
        if (transitionId !== undefined && transitionId !== null) {
          autoTransition = useViewTransition(transitionId.toString(), {
            duration:
              parseInt(wasm.readProp(attributes, "transitionDuration")) || 500,
            autoDirection:
              wasm.readProp(attributes, "transitionAutoDirection") !== "false",
          });
        }

        const querySelector = this.shadowRoot?.querySelector.bind(
          this.shadowRoot,
        );
        const getRef = (ref) => {
          const component = querySelector(ref);
          const refHookName =
            Object.keys(component.hooks).find(
              (o) => !!component.hooks[o].current,
            ) || "";
          return component.hooks[refHookName].current;
        };

        const useFS = (options = {}) =>
          _useFS(options, { useState, useEffect, useStore });

        const sharedDependencies = {
          useState,
          useEffect,
          useMemo,
          useScope,
          useStyle,
          useStore,
          useFS,
          useViewTransition,
          html,
          css,
          unsafeCSS,
          useRef,
          querySelector,
          getRef,
          renderChildren,
          keyed,
        };

        const children = this._slotContent || "";
        const childElements = this._childNodes.filter(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE ||
            (node.nodeType === Node.TEXT_NODE && node.textContent.trim()),
        );

        const componentProps = createComponentProps(
          attributes,
          hostProps,
          children,
          childElements,
        );

        let props = componentProps;
        if (inputs) {
          const checked = validateProps(inputs, componentProps);
          if (checked.ok) {
            props = checked.value;
          } else {
            console.error(
              `[dim] <${tag}> props rejected at ${checked.path}: ${checked.reason}`,
            );
            props = null;
          }
        }
        result = props
          ? CustomFunctionalComponent(props, sharedDependencies)
          : html``;
      } finally {
        wasm.endRender();
      }

      if (autoTransition) {
        return this._transitionHost.wrapRender(autoTransition, result, html);
      }
      this._transitionHost.cacheRenderResult(result);
      return result;
    }

    updated(changedProperties) {
      super.updated(changedProperties);
      this._transitionHost.onUpdated();
    }
  }

  if (!customElements.get(tag)) {
    window.customElements.define(tag, DimComponent);
  }

  CustomFunctionalComponent.tag = tag;
  CustomFunctionalComponent.inputs = inputs;
  return CustomFunctionalComponent;
}

wasm.initRuntime(define);
