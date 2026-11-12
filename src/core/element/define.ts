import {
  css,
  unsafeCSS,
  html,
  keyed,
  renderChildren,
} from "../renderer/index.js";
import { DimElement } from "./dim-element.js";
import { setCurrentInstance } from "./instance";
import { parseAttributes, readProp, createComponentProps } from "./props";
import { useState } from "../hooks/useState";
import { useEffect } from "../hooks/useEffect";
import { useMemo } from "../hooks/useMemo";
import { useRef } from "../hooks/useRef";
import { useStyle } from "../hooks/useStyle";
import { useScope } from "../hooks/useScope";
import { useStore } from "../store/useStore";
import { useViewTransition } from "../transitions/useViewTransition.js";
import { AutoTransitionHost } from "../transitions/auto-transition-host.js";
import { useFS as _useFS } from "../fs/useFS.js";

/**
 * Register a functional component as a custom element.
 * Stamps `component.tag = tag` and returns the component for useScope({ Comp }).
 */
export function define({ tag, component: CustomFunctionalComponent }) {
  class DimComponent extends DimElement {
    constructor() {
      super();
      this.hookIndex = 0;
      this.hooks = {};
      this._childNodes = [];
      this._slotContent = null;
      this._childNodesCaptured = false;
      this._attributeObserver = null;
      this._attributeUpdateScheduled = false;
      this._transitionHost = new AutoTransitionHost(this);
    }

    connectedCallback() {
      super.connectedCallback();
      // Capture child nodes before light-DOM composition is consumed
      if (!this._childNodesCaptured) {
        this._childNodes = Array.from(this.childNodes);
        this._slotContent = this.innerHTML;
        this._childNodesCaptured = true;
      }

      // dim renders from the host's attributes (see render()). Watch attribute
      // mutations so plain-attribute APIs (e.g. transitionId="${id}") re-render.
      // Safe from loops: render() writes only to the shadow root and we never
      // reflect props back to host attributes.
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
      // Reset hook index on every render
      this.hookIndex = 0;

      // Set the current instance context
      setCurrentInstance(this);

      const attributes = parseAttributes(this);

      // Ensure props object exists without going through the reactive setter
      // (which would schedule another update mid-render).
      if (!this._props) this._props = {};
      const hostProps = this._props;

      // Auto-detect transitionId prop and set up view transitions
      let autoTransition = null;
      const transitionId =
        readProp(attributes, "transitionId") ??
        readProp(hostProps, "transitionId");
      if (transitionId !== undefined && transitionId !== null) {
        autoTransition = useViewTransition(transitionId.toString(), {
          duration: parseInt(readProp(attributes, "transitionDuration")) || 500,
          autoDirection:
            readProp(attributes, "transitionAutoDirection") !== "false",
        });
      }

      const querySelector = this.shadowRoot?.querySelector.bind(
        this.shadowRoot
      );
      const getRef = (ref) => {
        const component = querySelector(ref);
        const refHookName =
          Object.keys(component.hooks).find(
            (o) => !!component.hooks[o].current
          ) || "";
        return component.hooks[refHookName].current;
      };

      // Create a useFS function that uses the current component context
      const useFS = (options = {}) => {
        return _useFS(options, { useState, useEffect, useStore });
      };

      // Injected deps match named exports (same html, keyed, renderChildren, …)
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

      // Process children to make them available
      const children = this._slotContent || "";
      const childElements = this._childNodes.filter(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())
      );

      const componentProps = createComponentProps(
        attributes,
        hostProps,
        children,
        childElements
      );

      // Call the functional component
      const result = CustomFunctionalComponent(
        componentProps,
        sharedDependencies
      );

      // Clear the current instance context
      setCurrentInstance(null);

      // Auto-wrap result with view transitions if transitionId is present
      if (autoTransition) {
        return this._transitionHost.wrapRender(
          autoTransition,
          result,
          html
        );
      }

      // Cache the latest render so a future transitionId can animate from it.
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

  // Stamp tag on the functional component for useScope({ Comp }) DX
  CustomFunctionalComponent.tag = tag;
  return CustomFunctionalComponent;
}
