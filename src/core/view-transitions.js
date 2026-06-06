/**
 * View Transitions Hook for Dim Framework
 * 
 * Provides automatic state change handling for view transitions.
 * Simply use a transitionId prop to enable smooth transitions between states.
 */

import { unsafeCSS } from "./mini-lit.js";

let currentInstance = null;

function getCurrentInstance() {
  if (!currentInstance) {
    throw new Error("useViewTransition can only be called inside a component.");
  }
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}

/**
 * Creates a view transition hook that automatically handles transition states
 * @param {string} transitionId - Unique identifier for this transition
 * @param {Object} options - Configuration options
 * @returns {Object} - Transition state and controls
 */
export function useViewTransition(transitionId, options = {}) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `view-transition-${hookIndex}`;

  const defaultOptions = {
    duration: 500,
    direction: 'auto', // 'auto', 'left', 'right', 'up', 'down'
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    autoDirection: true, // Automatically determine direction based on state change
    ...options
  };

  // Initialize hook state if not exists
  if (!component.hooks[hookName]) {
    component.hooks[hookName] = {
      isTransitioning: false,
      direction: 'right',
      currentTransitionId: transitionId,
      previousTransitionId: null,
      transitionCount: 0,
      options: defaultOptions
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
    } else if (state.options.autoDirection && prevId !== null && newTransitionId !== null) {
      // Try to parse numeric values to determine direction
      const prevNum = parseFloat(prevId);
      const newNum = parseFloat(newTransitionId);
      
      if (!isNaN(prevNum) && !isNaN(newNum)) {
        state.direction = newNum > prevNum ? 'right' : 'left';
      } else {
        // For non-numeric IDs, use string comparison
        state.direction = newTransitionId > prevId ? 'right' : 'left';
      }
    } else {
      state.direction = state.options.direction === 'auto' ? 'right' : state.options.direction;
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
    getTransitionClasses: (baseClass = '') => {
      const classes = [baseClass].filter(Boolean);
      
      if (state.isTransitioning) {
        classes.push('transitioning');
        classes.push(`slide-${state.direction}`);
        classes.push(`transition-${state.direction}`);
      }
      
      return classes.join(' ');
    },

    // Two-layer slide helpers. The incoming (current) content slides IN and is
    // never placed in a hidden exit state; the outgoing (previous) content
    // slides OUT in the opposite direction.
    getIncomingClass: (baseClass = 'vt-layer') => {
      const classes = [baseClass].filter(Boolean);
      if (state.isTransitioning) {
        classes.push(`slide-in-${state.direction}`);
      }
      return classes.join(' ');
    },

    getOutgoingClass: (baseClass = 'vt-layer') => {
      const classes = [baseClass].filter(Boolean);
      // Outgoing content leaves toward the opposite side of the incoming slide.
      classes.push(state.direction === 'right' ? 'slide-out-left' : 'slide-out-right');
      return classes.join(' ');
    },
    
    // Style helpers
    getTransitionStyles: () => ({
      transition: state.isTransitioning 
        ? `all ${state.options.duration}ms ${state.options.easing}`
        : 'none',
      '--transition-duration': `${state.options.duration}ms`,
      '--transition-easing': state.options.easing,
      '--transition-direction': state.direction
    }),

    // Configuration
    options: state.options
  };
}

/**
 * CSS helper for view transitions - provides common transition styles
 */
export const viewTransitionStyles = unsafeCSS(`
  /* Auto-transition hosts must be block-level so the wrapper and its layers can
     establish a height. Custom elements default to display:inline, which would
     collapse the absolutely-positioned layers to zero height (the slide would
     be invisible). */
  :host {
    display: block;
  }

  /* Base transition styles */
  .view-transition-container {
    position: relative;
    overflow: hidden;
  }

  /* While the wrapper height is animating between old and new content sizes */
  .auto-transition-wrapper.vt-resizing {
    overflow: hidden;
  }

  .view-transition-item {
    transition: all var(--transition-duration, 500ms) var(--transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  /* Two-layer slide: layers are stacked and animate independently */
  .vt-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* The incoming layer stays in normal document flow so it gives the wrapper a
     real height; the outgoing layer is the absolute overlay that slides off on
     top of it. Without this both layers are absolute and the wrapper collapses
     to zero height, hiding the animation entirely. Transforms used by the
     slide animations don't affect layout, so height stays stable. */
  .vt-layer.vt-incoming {
    position: relative;
  }

  /* Shared-element (FLIP) transitions. A node marked data-vt-shared="key" that
     exists in both the outgoing and incoming content is lifted into this
     overlay and animated from its old position to its new one, independently of
     the page slide. The in-layer copies are hidden so only the overlay travels. */
  .vt-shared-overlays {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
  }

  .vt-shared-overlay {
    position: absolute;
    margin: 0;
    box-sizing: border-box;
    overflow: hidden;
    will-change: transform;
    backface-visibility: hidden;
  }

  .vt-shared-hidden {
    visibility: hidden;
  }

  /* Outgoing layer slides off-screen */
  .slide-out-left {
    animation: slideOutToLeft var(--transition-duration, 500ms) var(--transition-easing, cubic-bezier(0.4, 0, 0.2, 1)) forwards;
  }

  .slide-out-right {
    animation: slideOutToRight var(--transition-duration, 500ms) var(--transition-easing, cubic-bezier(0.4, 0, 0.2, 1)) forwards;
  }

  @keyframes slideOutToLeft {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  @keyframes slideOutToRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  /* Sliding transitions */
  .transitioning.slide-left,
  .transitioning.transition-left {
    transform: translateX(-100%);
    opacity: 0;
  }

  .transitioning.slide-right,
  .transitioning.transition-right {
    transform: translateX(100%);
    opacity: 0;
  }

  .transitioning.slide-up,
  .transitioning.transition-up {
    transform: translateY(-100%);
    opacity: 0;
  }

  .transitioning.slide-down,
  .transitioning.transition-down {
    transform: translateY(100%);
    opacity: 0;
  }

  /* Slide-in animations */
  .slide-in-left {
    animation: slideInFromLeft var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  .slide-in-right {
    animation: slideInFromRight var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  .slide-in-up {
    animation: slideInFromTop var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  .slide-in-down {
    animation: slideInFromBottom var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  /* Keyframe animations */
  @keyframes slideInFromLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromTop {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromBottom {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Fade transitions */
  .transitioning.fade {
    opacity: 0;
  }

  .fade-in {
    animation: fadeIn var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Scale transitions */
  .transitioning.scale {
    transform: scale(0.8);
    opacity: 0;
  }

  .scale-in {
    animation: scaleIn var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`);

export default { useViewTransition, viewTransitionStyles };