import React, { memo, ComponentType } from 'react';

type EqualityFn<P> = (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;

export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: EqualityFn<P>
) {
  const displayName = Component.displayName || Component.name || 'Component';
  const WrappedComponent = memo(Component, propsAreEqual);
  WrappedComponent.displayName = `withMemo(${displayName})`;
  return WrappedComponent;
} 