export function prepareTemplate(strings: any): {
    element: HTMLTemplateElement;
    partInfo: {
        kind: any;
        name: any;
        valuePrefix: any;
        valueSuffix: any;
        rawText: any;
    }[];
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
export const templateCache: WeakMap<object, any>;
import { CHILD_PART } from "./pure/index.js";
import { ATTR_PART } from "./pure/index.js";
import { PROP_PART } from "./pure/index.js";
import { EVENT_PART } from "./pure/index.js";
import { BOOL_PART } from "./pure/index.js";
import { REF_PART } from "./pure/index.js";
import { COMMENT_MARKER } from "./pure/index.js";
import { TEXT_MARKER } from "./pure/index.js";
export { CHILD_PART, ATTR_PART, PROP_PART, EVENT_PART, BOOL_PART, REF_PART, COMMENT_MARKER, TEXT_MARKER };
//# sourceMappingURL=prepare.d.ts.map