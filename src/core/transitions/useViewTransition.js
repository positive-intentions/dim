/**
 * View Transitions Hook for Dim Framework
 *
 * Provides automatic state change handling for view transitions.
 * Simply use a transitionId prop to enable smooth transitions between states.
 */

import { getCurrentInstance } from "../element/instance";

export function useViewTransition(transitionId, options = {}) {
  const component = getCurrentInstance();
  if (!component) {
    throw new Error("useViewTransition can only be called inside a component.");
  }
  const hookIndex = component.hookIndex++;
  const hookName = `view-transition-${hookIndex}`;

  const defaultOptions = {
    duration: 500,
    direction: "auto", // 'auto', 'left', 'right', 'up', 'down'
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    autoDirection: true, // Automatically determine direction based on state change
    ...options,
  };

  // Initialize hook state if not exists
  if (!component.hooks[hookName]) {
    component.hooks[hookName] = {
      isTransitioning: false,
      direction: "right",
      currentTransitionId: transitionId,
      previousTransitionId: null,
      transitionCount: 0,
      options: defaultOptions,
    };
  }

  const state = component.hooks[hookName];

  // Update options if they've changed
  state.options = { ...state.options, ...options };

  // Transition control functions
  const startTransition = (newTransitionId, direction = null) => {
    if (state.isTransitioning) return false;

    const prevId = state.currentTransitionId;
    state.previousTransitionId = prevId;
    state.currentTransitionId = newTransitionId;
    state.isTransitioning = true;
    state.transitionCount++;

    // Auto-determine direction if enabled and not explicitly provided
    if (direction) {
      state.direction = direction;
    } else if (
      state.options.autoDirection &&
      prevId !== null &&
      newTransitionId !== null
    ) {
      // Try to parse numeric values to determine direction
      const prevNum = parseFloat(prevId);
      const newNum = parseFloat(newTransitionId);

      if (!isNaN(prevNum) && !isNaN(newNum)) {
        state.direction = newNum > prevNum ? "right" : "left";
      } else {
        // For non-numeric IDs, use string comparison
        state.direction = newTransitionId > prevId ? "right" : "left";
      }
    } else {
      state.direction =
        state.options.direction === "auto" ? "right" : state.options.direction;
    }

    // Automatically end transition after duration. Guard against the component
    // being disconnected before the timer fires so we don't call requestUpdate
    // on an unmounted element.
    setTimeout(() => {
      if (component.isConnected === false) {
        state.isTransitioning = false;
        return;
      }
      endTransition();
    }, state.options.duration);

    // Force component re-render
    component.requestUpdate();
    return true;
  };

  const endTransition = () => {
    if (!state.isTransitioning) return;

    state.isTransitioning = false;
    component.requestUpdate();
  };

  // Auto-start transition when transitionId changes
  if (transitionId !== state.currentTransitionId && !state.isTransitioning) {
    startTransition(transitionId);
  }

  return {
    // State
    isTransitioning: state.isTransitioning,
    direction: state.direction,
    currentId: state.currentTransitionId,
    previousId: state.previousTransitionId,

    // Controls
    startTransition,
    endTransition,

    // CSS class helpers (legacy single-layer helper, kept for back-compat)
    getTransitionClasses: (baseClass = "") => {
      const classes = [baseClass].filter(Boolean);

      if (state.isTransitioning) {
        classes.push("transitioning");
        classes.push(`slide-${state.direction}`);
        classes.push(`transition-${state.direction}`);
      }

      return classes.join(" ");
    },

    // Two-layer slide helpers. The incoming (current) content slides IN and is
    // never placed in a hidden exit state; the outgoing (previous) content
    // slides OUT in the opposite direction.
    getIncomingClass: (baseClass = "vt-layer") => {
      const classes = [baseClass].filter(Boolean);
      if (state.isTransitioning) {
        classes.push(`slide-in-${state.direction}`);
      }
      return classes.join(" ");
    },

    getOutgoingClass: (baseClass = "vt-layer") => {
      const classes = [baseClass].filter(Boolean);
      // Outgoing content leaves toward the opposite side of the incoming slide.
      classes.push(
        state.direction === "right" ? "slide-out-left" : "slide-out-right",
      );
      return classes.join(" ");
    },

    // Style helpers
    getTransitionStyles: () => ({
      transition: state.isTransitioning
        ? `all ${state.options.duration}ms ${state.options.easing}`
        : "none",
      "--transition-duration": `${state.options.duration}ms`,
      "--transition-easing": state.options.easing,
      "--transition-direction": state.direction,
    }),

    // Configuration
    options: state.options,
  };
}
