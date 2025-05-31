import { getCurrentInstance } from '../utils/instance.js';

export function useRef(initialValue) {
    const component = getCurrentInstance();
    const hookIndex = component.hookIndex++;
    const hookName = `hook-${hookIndex}`;
    
    if (!component.hooks[hookName]) {
        component.hooks[hookName] = { current: initialValue };
    }
    
    return component.hooks[hookName];
}