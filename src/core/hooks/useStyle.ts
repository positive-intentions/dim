import { getCurrentInstance } from "../element/instance";
import { unsafeCSS } from "../renderer/index.js";

export function useStyle(styles: any) {
  const component = getCurrentInstance() as any;
  const hookIndex = component.hookIndex++;
  const hookName = `style-hook-${hookIndex}`;

  // Convert styles to CSSResult if it's a string
  const cssResult = typeof styles === "string" ? unsafeCSS(styles) : styles;
  const cssText = cssResult.cssText;

  // Check if styles have changed — queue for flush after render commit
  // so the first render's container clear does not wipe style nodes.
  const prevStyles = component.hooks[hookName];
  if (prevStyles !== cssText) {
    component.hooks[hookName] = cssText;
    component.__styleQueue = component.__styleQueue || [];
    component.__styleQueue.push({
      hookName,
      cssText,
      cssResult,
      preferAdopted: !prevStyles,
    });
  }
}
