/**
 * Register a functional component as a custom element.
 * Stamps `component.tag = tag` and returns the component for useScope({ Comp }).
 * Optional `inputs` (a `t.record` schema) validates + sanitizes props before
 * every render; rejected props render nothing and log a console error.
 */
export declare function define({ tag, component: CustomFunctionalComponent, inputs, }: {
    tag: string;
    component: any;
    inputs?: any;
}): any;
//# sourceMappingURL=define.d.ts.map