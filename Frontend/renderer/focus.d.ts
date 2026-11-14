export function setSkipFocusRestore(value: any): void;
export function isFormControl(el: any): boolean;
export function captureFocus(container: any): {
    el: any;
};
export function restoreFocus(snapshot: any): void;
/**
 * Focus / selection helpers used during parts commits.
 * skipFocusRestore is set during view-transition two-layer commits.
 */
/** Flag set during view-transition two-layer commits to skip focus restore. */
export let skipFocusRestore: boolean;
//# sourceMappingURL=focus.d.ts.map