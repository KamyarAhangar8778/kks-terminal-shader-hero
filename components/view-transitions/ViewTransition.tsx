'use client';

import React from 'react';
import type { ViewTransitionProps, DirectionalTransitionProps } from './types';

type ReactWithViewTransitions = typeof React & {
  ViewTransition?: React.ComponentType<ViewTransitionProps>;
  unstable_ViewTransition?: React.ComponentType<ViewTransitionProps>;
};

const reactWithVT = React as ReactWithViewTransitions;
const NativeReactVT = reactWithVT.ViewTransition ?? reactWithVT.unstable_ViewTransition;

export const ViewTransition: React.FC<ViewTransitionProps> = function ViewTransition({
  children,
  ...props
}) {
  if (NativeReactVT) {
    return <NativeReactVT {...props}>{children}</NativeReactVT>;
  }
  return <>{children}</>;
};

/**
 * Connects directional navigation transition types ('nav-forward' and 'nav-back')
 * to CSS View Transition animations.
 */
export function DirectionalTransition({ children, className }: DirectionalTransitionProps) {
  return (
    <ViewTransition
      enter={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'none',
      }}
      default="none"
    >
      {className ? <div className={className}>{children}</div> : children}
    </ViewTransition>
  );
}
