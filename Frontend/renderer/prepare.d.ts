export function prepareTemplate(strings: any): {
    element: HTMLTemplateElement;
    partInfo: ({
        kind: number;
        rawText: boolean;
        name?: undefined;
        valuePrefix?: undefined;
        valueSuffix?: undefined;
    } | {
        kind: number;
        name: any;
        valuePrefix: any;
        valueSuffix: string;
        rawText?: undefined;
    })[];
};
export function createInstance(template: any): {
    fragment: any;
    parts: ({
        kind: number;
        start: Text;
        end: Text;
        committed: any;
        name?: undefined;
        element?: undefined;
        listener?: undefined;
        valuePrefix?: undefined;
        valueSuffix?: undefined;
    } | {
        kind: any;
        name: any;
        element: any;
        start?: undefined;
        end?: undefined;
        committed?: undefined;
        listener?: undefined;
        valuePrefix?: undefined;
        valueSuffix?: undefined;
    } | {
        kind: any;
        name: any;
        element: Node;
        listener: any;
        committed: any;
        valuePrefix: any;
        valueSuffix: any;
        start?: undefined;
        end?: undefined;
    })[];
};
/**
 * Template preparation — marker-based parts.
 * Turns html strings into a <template> plus a part-info list, then
 * instantiates a fragment with live part records.
 */
export const CHILD_PART: 0;
export const ATTR_PART: 1;
export const PROP_PART: 2;
export const EVENT_PART: 3;
export const BOOL_PART: 4;
export const REF_PART: 5;
export const templateCache: WeakMap<object, any>;
//# sourceMappingURL=prepare.d.ts.map