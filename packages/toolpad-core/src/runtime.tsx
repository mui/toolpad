import * as React from 'react';
import { Error as ErrorIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { RUNTIME_PROP_NODE_ID } from './constants.js';
import type {
  ComponentConfig,
  RuntimeEvent,
  ArgTypeDefinition,
  BindableAttrValue,
  LiveBinding,
  RuntimeError,
} from './types';

const ResetNodeErrorsKeyContext = React.createContext(0);

export const ResetNodeErrorsKeyProvider = ResetNodeErrorsKeyContext.Provider;

declare global {
  interface Window {
    __TOOLPAD_RUNTIME_EVENT__?: RuntimeEvent[] | ((event: RuntimeEvent) => void);
  }
}

export const NodeRuntimeContext = React.createContext<string | null>(null);

export interface NodeRuntimeWrapperProps {
  children: React.ReactElement;
  nodeId: string;
  componentConfig: ComponentConfig<any>;
}

export interface NodeFiberHostProps {
  children: React.ReactElement;
  [RUNTIME_PROP_NODE_ID]: string;
  componentConfig: ComponentConfig<any>;
  nodeError?: RuntimeError | null;
}

interface NodeErrorProps {
  error: RuntimeError;
}

function NodeError({ error }: NodeErrorProps) {
  return (
    <Tooltip title={error.message}>
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8,
          background: 'red',
          color: 'white',
        }}
      >
        <ErrorIcon color="inherit" style={{ marginRight: 8 }} /> Error
      </span>
    </Tooltip>
  );
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

export function NodeRuntimeWrapper({ nodeId, componentConfig, children }: NodeRuntimeWrapperProps) {
  const resetNodeErrorsKey = React.useContext(ResetNodeErrorsKeyContext);
  return (
    <ErrorBoundary
      resetKeys={[resetNodeErrorsKey]}
      fallbackRender={({ error }) => (
        <NodeFiberHost
          {...{
            [RUNTIME_PROP_NODE_ID]: nodeId,
            nodeError: error,
            componentConfig,
          }}
        >
          <NodeError error={error} />
        </NodeFiberHost>
      )}
    >
      <NodeRuntimeContext.Provider value={nodeId}>
        <NodeFiberHost
          {...{
            [RUNTIME_PROP_NODE_ID]: nodeId,
            componentConfig,
          }}
        >
          {children}
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

let iframe: HTMLIFrameElement;
function evalCode(code: string, globalScope: Record<string, unknown>) {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.style.display = 'none';
    document.documentElement.appendChild(iframe);
  }

  // eslint-disable-next-line no-underscore-dangle
  (iframe.contentWindow as any).__SCOPE = globalScope;
  return (iframe.contentWindow as any).eval(`with (window.__SCOPE) { ${code} }`);
}

export function evaluateBindable<V>(
  bindable: BindableAttrValue<V> | null,
  globalScope: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argType?: ArgTypeDefinition,
): LiveBinding {
  const execExpression = () => {
    if (bindable?.type === 'jsExpression') {
      return evalCode(bindable?.value, globalScope);
    }

    if (bindable?.type === 'const') {
      return bindable?.value;
    }

    return undefined;
  };

  try {
    const value = execExpression();
    return { value };
  } catch (err) {
    return { error: err as Error };
  }
}

export * from './jsRuntime';
