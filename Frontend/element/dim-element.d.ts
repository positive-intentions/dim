export class DimElement extends HTMLElement {
    __controllers: any[];
    __updatePromise: Promise<boolean>;
    __hasRequestedUpdate: boolean;
    __isConnected: boolean;
    __hasRendered: boolean;
    _props: any;
    /** @type {ShadowRoot|null} */
    renderRoot: ShadowRoot | null;
    set props(value: any);
    /**
     * Reactive `.props` property. Assigning triggers update.
     */
    get props(): any;
    createRenderRoot(): ShadowRoot;
    connectedCallback(): void;
    disconnectedCallback(): void;
    addController(controller: any): void;
    removeController(controller: any): void;
    requestUpdate(): Promise<boolean>;
    get updateComplete(): Promise<boolean>;
    __doUpdate(): Promise<boolean>;
    __styleQueue: any[];
    __flushStyles(): void;
    __adoptedSheets: any;
    /** Override in subclass / DimComponent */
    render(): {
        _$dimType$: 1;
        strings: any;
        values: any[];
    };
    /** Override — called after render commits */
    updated(): void;
}
//# sourceMappingURL=dim-element.d.ts.map