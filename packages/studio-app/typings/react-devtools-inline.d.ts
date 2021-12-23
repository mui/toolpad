declare module 'react-devtools-inline' {
  import * as React from 'react';

  export interface FiberRootNode {
    current: FiberNode | null;
  }

  export interface FiberNode {
    child: FiberNode | null;
    return: FiberNode | null;
    sibling: FiberNode | null;
    memoizedProps: { [key: string]: unknown } | null;
    pendingProps: { [key: string]: unknown } | null;
    elementType:
      | React.FunctionComponent<P>
      | React.ComponentClass<P>
      | string
      | unique symbol
      | null;
  }

  export interface Renderer {
    findFiberByHostInstance: (elm: Element) => FiberNode;
    findHostInstanceByFiber: (fiber: FiberNode) => Element;
  }

  export interface Hook {
    getFiberRoots: (rendererId: number) => Set<FiberRootNode>;
    renderers: Map<number, Renderer>;
  }
}

declare module 'react-devtools-inline/backend' {
  export function initialize(window: Window): void;
}
