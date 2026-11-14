export function useViewTransition(transitionId: any, options?: {}): {
    isTransitioning: any;
    direction: any;
    currentId: any;
    previousId: any;
    startTransition: (newTransitionId: any, direction?: any) => boolean;
    endTransition: () => void;
    getTransitionClasses: (baseClass?: string) => string;
    getIncomingClass: (baseClass?: string) => string;
    getOutgoingClass: (baseClass?: string) => string;
    getTransitionStyles: () => {
        transition: string;
        "--transition-duration": string;
        "--transition-easing": any;
        "--transition-direction": any;
    };
    options: any;
};
//# sourceMappingURL=useViewTransition.d.ts.map