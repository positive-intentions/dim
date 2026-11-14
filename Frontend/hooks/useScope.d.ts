/**
 * Register child components in scope.
 * Supports:
 *   useScope({ "child-tag": ChildFn })
 *   useScope({ ChildFn })  // uses ChildFn.tag stamped by define()
 */
export declare function useScope(elements: any): void;
export declare const useLazyScope: (tag: string, promise: Promise<any>) => void;
//# sourceMappingURL=useScope.d.ts.map