import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ToolpadComponents } from './types';
import { RUNTIME_PROP_NODE_ID, RUNTIME_PROP_SLOTS } from './constants.js';
import type { SlotType, ComponentConfig, RuntimeEvent, RuntimeError } from './types';

const ResetNodeErrorsKeyContext = React.createContext(0);

export const ResetNodeErrorsKeyProvider = ResetNodeErrorsKeyContext.Provider;

export type Components = ToolpadComponents;

export const ComponentsContext = React.createContext<ToolpadComponents | null>(null);

const ComponentsProvider = ComponentsContext.Provider;

declare global {
  interface Window {
    __TOOLPAD_RUNTIME_EVENT__?: RuntimeEvent[] | ((event: RuntimeEvent) => void);
  }
}

export const NodeRuntimeContext = React.createContext<string | null>(null);

// NOTE: These props aren't used, they are only there to transfer information from the
// React elements to the fibers.
interface SlotsWrapperProps {
  children?: React.ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_SLOTS]: string;
  // eslint-disable-next-line react/no-unused-prop-types
  slotType: SlotType;
  // eslint-disable-next-line react/no-unused-prop-types
  parentId: string;
}

function SlotsWrapper({ children }: SlotsWrapperProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

interface PlaceholderWrapperProps {
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_SLOTS]: string;
  // eslint-disable-next-line react/no-unused-prop-types
  parentId: string;
}

// We want typescript to enforce these props, even when they're not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PlaceholderWrapper(props: PlaceholderWrapperProps) {
  return (
    <div
      style={{
        minHeight: 72,
        minWidth: 200,
      }}
    />
  );
}

export interface NodeErrorProps {
  error: RuntimeError;
}

export interface NodeFiberHostProps {
  children: React.ReactElement;
  [RUNTIME_PROP_NODE_ID]: string;
  componentConfig: ComponentConfig<any>;
  nodeError?: RuntimeError | null;
}

// We will use [RUNTIME_PROP_NODE_ID] while walking the fibers to detect React Elements that
// represent AppDomNodes. We use a wrapper to ensure only one element exists in the React tree
// that has [RUNTIME_PROP_NODE_ID] property with this nodeId (We could clone the child and add
// the prop, but the child may be spreading its props to other elements). We also don't want this
// property to end up on DOM nodes.
// IMPORTANT! This node must directly wrap the React Element for the AppDomNode
function NodeFiberHost({ children }: NodeFiberHostProps) {
  return children;
}

export interface NodeRuntimeWrapperProps {
  children: React.ReactElement;
  nodeId: string;
  componentConfig: ComponentConfig<any>;
  NodeError: React.ComponentType<NodeErrorProps>;
  components: Components;
}

export function NodeRuntimeWrapper({
  nodeId,
  componentConfig,
  children,
  NodeError,
  components,
}: NodeRuntimeWrapperProps) {
  const resetNodeErrorsKey = React.useContext(ResetNodeErrorsKeyContext);

  const ErrorFallback = React.useCallback(
    ({ error }: FallbackProps) => (
      <NodeFiberHost
        {...{
          [RUNTIME_PROP_NODE_ID]: nodeId,
          nodeError: error,
          componentConfig,
        }}
      >
        <NodeError error={error} />
      </NodeFiberHost>
    ),
    [NodeError, componentConfig, nodeId],
  );

  return (
    <ErrorBoundary resetKeys={[resetNodeErrorsKey]} fallbackRender={ErrorFallback}>
      <NodeRuntimeContext.Provider value={nodeId}>
        <NodeFiberHost
          {...{
            [RUNTIME_PROP_NODE_ID]: nodeId,
            componentConfig,
          }}
        >
          <ComponentsProvider value={components}>{children}</ComponentsProvider>
        </NodeFiberHost>
      </NodeRuntimeContext.Provider>
    </ErrorBoundary>
  );
}

export interface NodeRuntime<P> {
  updateAppDomConstProp: <K extends keyof P & string>(
    key: K,
    value: React.SetStateAction<P[K]>,
  ) => void;
}

export function fireEvent(event: RuntimeEvent) {
  // eslint-disable-next-line no-underscore-dangle
  if (!window.__TOOLPAD_RUNTIME_EVENT__) {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_RUNTIME_EVENT__ = [] as RuntimeEvent[];
  }
  // eslint-disable-next-line no-underscore-dangle
  if (typeof window.__TOOLPAD_RUNTIME_EVENT__ === 'function') {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_RUNTIME_EVENT__(event);
  } else {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_RUNTIME_EVENT__.push(event);
  }
}

export function setEventHandler(window: Window, handleEvent: (event: RuntimeEvent) => void) {
  // eslint-disable-next-line no-underscore-dangle
  if (typeof window.__TOOLPAD_RUNTIME_EVENT__ === 'function') {
    throw new Error(`Event handler already attached.`);
  }

  // eslint-disable-next-line no-underscore-dangle
  const queuedEvents = Array.isArray(window.__TOOLPAD_RUNTIME_EVENT__)
    ? // eslint-disable-next-line no-underscore-dangle
      window.__TOOLPAD_RUNTIME_EVENT__
    : [];

  queuedEvents.forEach((event) => handleEvent(event));

  // eslint-disable-next-line no-underscore-dangle
  window.__TOOLPAD_RUNTIME_EVENT__ = (event) => handleEvent(event);

  return () => {
    // eslint-disable-next-line no-underscore-dangle
    delete window.__TOOLPAD_RUNTIME_EVENT__;
  };
}

export function useNode<P = {}>(): NodeRuntime<P> | null {
  const nodeId = React.useContext(NodeRuntimeContext);

  return React.useMemo(() => {
    if (!nodeId) {
      return null;
    }
    return {
      updateAppDomConstProp: (prop, value) => {
        fireEvent({
          type: 'propUpdated',
          nodeId,
          prop,
          value,
        });
      },
    };
  }, [nodeId]);
}

export interface PlaceholderProps {
  prop: string;
  children?: React.ReactNode;
  hasLayout?: boolean;
}

export function Placeholder({ prop, children, hasLayout = false }: PlaceholderProps) {
  const nodeId = React.useContext(NodeRuntimeContext);
  if (!nodeId) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const count = React.Children.count(children);
  return count > 0 ? (
    <React.Fragment>{children}</React.Fragment>
  ) : (
    <PlaceholderWrapper
      parentId={nodeId}
      {...{
        [RUNTIME_PROP_SLOTS]: prop,
        slotType: hasLayout ? 'layout' : 'single',
      }}
    />
  );
}

export interface SlotsProps {
  prop: string;
  children?: React.ReactNode;
}

export function Slots({ prop, children }: SlotsProps) {
  const nodeId = React.useContext(NodeRuntimeContext);
  if (!nodeId) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const count = React.Children.count(children);
  return count > 0 ? (
    <SlotsWrapper
      parentId={nodeId}
      {...{
        [RUNTIME_PROP_SLOTS]: prop,
        slotType: 'multiple',
      }}
    >
      {children}
    </SlotsWrapper>
  ) : (
    <Placeholder prop={prop} />
  );
}
