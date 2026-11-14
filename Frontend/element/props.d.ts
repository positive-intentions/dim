/**
 * Attribute / props helpers for DimComponent.render().
 * HTML lowercases attribute names, so lookups are case-insensitive.
 */
export declare function parseAttributes(element: any): unknown;
export declare function readProp(obj: any, name: any): any;
/**
 * Wrap merged attributes + host props in a case-insensitive proxy so
 * components can read camelCase attributes even though the DOM stores
 * them lowercased.
 */
export declare function createComponentProps(attributes: any, hostProps: any, children: any, childElements: any): any;
//# sourceMappingURL=props.d.ts.map