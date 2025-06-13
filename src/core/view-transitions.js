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

    // Automatically end transition after duration
    setTimeout(() => {
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
    
    // CSS class helpers
    getTransitionClasses: (baseClass = '') => {
      const classes = [baseClass].filter(Boolean);
      
      if (state.isTransitioning) {
        classes.push('transitioning');
        classes.push(`slide-${state.direction}`);
        classes.push(`transition-${state.direction}`);
      }
      
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
  /* Base transition styles */
  .view-transition-container {
    position: relative;
    overflow: hidden;
  }

  .view-transition-item {
    transition: all var(--transition-duration, 500ms) var(--transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
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