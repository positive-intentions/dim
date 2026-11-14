/**
 * Manages auto view-transition rendering (two-layer slide), shared-element
 * FLIP, and wrapper height animation for a DimComponent host.
 */
export class AutoTransitionHost {
    constructor(host: any);
    host: any;
    _previousRenderResult: any;
    _sharedRects: {};
    _flipTransitionKey: any;
    _flipPlayed: boolean;
    _isTransitioningNow: boolean;
    _flipDuration: number;
    _flipEasing: string;
    _sharedOverlayContainer: HTMLDivElement;
    _wrapperHeights: {
        old: any;
    };
    _containerResizePlayed: boolean;
    _wrapperHeightAnimation: any;
    /**
     * Build the template for an auto-transition component render.
     * @param {object} autoTransition
     * @param {*} result
     * @param {Function} html - Dim html tagged template (same as public export)
     */
    wrapRender(autoTransition: object, result: any, html: Function): any;
    cacheRenderResult(result: any): void;
    onUpdated(): void;
    cleanupTransitionEffects(): void;
    disconnect(): void;
    _applyFlipVisualStyles(source: any, clone: any): void;
    _captureSharedRects(): {};
    _runContainerHeightTransition(duration: any, easing: any): void;
    _runSharedElementFlip(duration: any, easing: any): void;
}
//# sourceMappingURL=auto-transition-host.d.ts.map