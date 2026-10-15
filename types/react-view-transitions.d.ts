/**
 * TypeScript Type Definitions for React View Transitions API
 * Extends the 'react' module with ViewTransition and addTransitionType declarations.
 */

import 'react';

declare module 'react' {
  export type ViewTransitionClass = string | 'auto' | 'none';

  export type ViewTransitionClassPerType = {
    default: ViewTransitionClass;
    [transitionType: string]: ViewTransitionClass;
  };

  export type ViewTransitionPropValue = ViewTransitionClass | ViewTransitionClassPerType;

  export interface ViewTransitionInstance {
    name: string;
    group: Element;
    imagePair: Element;
    old?: Element;
    new?: Element;
  }

  export interface ViewTransitionProps {
    /** Unique view-transition-name for shared element morphs */
    name?: string;
    /** Animation class or type map when entering */
    enter?: ViewTransitionPropValue;
    /** Animation class or type map when exiting */
    exit?: ViewTransitionPropValue;
    /** Animation class or type map when sharing between views */
    share?: ViewTransitionPropValue;
    /** Animation class or mode when mutating or moving within layout */
    update?: ViewTransitionClass;
    /** Default animation mode for unspecified triggers ('auto' or 'none') */
    default?: 'auto' | 'none' | string;
    /** Children content */
    children?: React.ReactNode;
    /** Key to force remount */
    key?: React.Key;
    /** Imperative callback on enter */
    onEnter?: (instance: ViewTransitionInstance, types: string[]) => void | (() => void);
    /** Imperative callback on exit */
    onExit?: (instance: ViewTransitionInstance, types: string[]) => void | (() => void);
    /** Imperative callback on update */
    onUpdate?: (instance: ViewTransitionInstance, types: string[]) => void | (() => void);
    /** Imperative callback on share */
    onShare?: (instance: ViewTransitionInstance, types: string[]) => void | (() => void);
  }

  export const ViewTransition: React.ComponentType<ViewTransitionProps>;
  export const unstable_ViewTransition: React.ComponentType<ViewTransitionProps>;

  export function addTransitionType(type: string): void;
  export function unstable_addTransitionType(type: string): void;
}
