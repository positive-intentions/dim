// Type definitions for Dim framework

import { TemplateResult } from "lit";

export interface DimProps {
  [key: string]: any;
  children?: string;
}

export interface DimDependencies {
  useState: typeof useState;
  useEffect: typeof useEffect;
  useMemo: typeof useMemo;
  useRef: typeof useRef;
  useScope: typeof useScope;
  useStyle: typeof useStyle;
  useStore: typeof useStore;
  useLazyScope: typeof useLazyScope;
  html: typeof html;
  css: typeof css;
  querySelector: (selector: string) => Element | null;
  getRef: (ref: string) => any;
}

export type DimComponent<P = {}> = (
  props: DimProps & P,
  deps: DimDependencies,
) => TemplateResult;

export interface DefineOptions<P = {}> {
  tag: string;
  component: DimComponent<P>;
}

export function define<P = {}>(options: DefineOptions<P>): void;

export function useState<T>(
  initialState: T,
): [T, (value: T | ((prev: T) => T)) => void];

export function useEffect(
  effect: () => void | (() => void),
  dependencies: any[],
): void;

export function useMemo<T>(calculation: () => T, dependencies: any[]): T;

export function useRef<T = any>(): { current: T };

export function useScope(elements: Record<string, DimComponent>): void;

export function useStyle(styles: TemplateResult): void;

export function useStore<T extends Record<string, any>>(store: T): T;

export function useLazyScope(tag: string, promise: Promise<any>): void;

export { html, css, unsafeCSS } from "lit";
