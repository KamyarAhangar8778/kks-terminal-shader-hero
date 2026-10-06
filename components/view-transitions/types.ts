import React from 'react';

export type ViewTransitionClass = string | 'auto' | 'none';

export const TRANSITION_TYPES = [
  'default',
  'nav-forward',
  'nav-back',
  'select-project',
  'close-project',
  'filter-category',
] as const;

export type TransitionType = (typeof TRANSITION_TYPES)[number];

type ReactWithTransitionType = typeof React & {
  addTransitionType?: (type: string) => void;
  unstable_addTransitionType?: (type: string) => void;
};

const reactWithTT = React as ReactWithTransitionType;
const nativeAddTransitionType =
  reactWithTT.addTransitionType ?? reactWithTT.unstable_addTransitionType;

/**
 * Tags an active React Transition with a semantic transition type
 * so `<ViewTransition>` boundaries can select context-specific animations.
 */
export function addTransitionType(type: TransitionType | (string & {})): void {
  if (typeof nativeAddTransitionType === 'function') {
    nativeAddTransitionType(type);
  }
}

export interface ViewTransitionClassMap {
  default: ViewTransitionClass;
  [type: string]: ViewTransitionClass;
}

export type ViewTransitionPropValue = ViewTransitionClass | ViewTransitionClassMap;

export interface ViewTransitionProps {
  name?: string;
  enter?: ViewTransitionPropValue;
  exit?: ViewTransitionPropValue;
  share?: ViewTransitionPropValue;
  update?: ViewTransitionClass;
  default?: 'auto' | 'none' | string;
  children?: React.ReactNode;
  key?: React.Key;
  onEnter?: (instance: unknown, types: string[]) => void | (() => void);
  onExit?: (instance: unknown, types: string[]) => void | (() => void);
  onUpdate?: (instance: unknown, types: string[]) => void | (() => void);
  onShare?: (instance: unknown, types: string[]) => void | (() => void);
}

export interface DirectionalTransitionProps {
  children: React.ReactNode;
  className?: string;
}
