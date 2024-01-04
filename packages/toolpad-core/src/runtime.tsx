import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Emitter } from '@mui/toolpad-utils/events';
import * as ReactIs from 'react-is';
import { hasOwnProperty } from '@mui/toolpad-utils/collections';
import { createProvidedContext } from '@mui/toolpad-utils/react';
import { Stack } from '@mui/material';
import { RuntimeEvents, ToolpadComponents, ToolpadComponent, ArgTypeDefinition } from './types';
import { TOOLPAD_COMPONENT } from './constants';
import type {
  RuntimeEvent,
  RuntimeError,
  PaginationMode,
  ToolpadDataProviderBase,
  NodeId,
} from './types';
import { createComponent } from './browser';

const ResetNodeErrorsKeyContext = React.createContext(0);

export const ResetNodeErrorsKeyProvider = ResetNodeErrorsKeyContext.Provider;

export type Components = ToolpadComponents;

export const ComponentsContext = React.createContext<ToolpadComponents | null>(null);

declare global {
  interface Window {
    __TOOLPAD_RUNTIME_EVENT__?: RuntimeEvent[] | ((event: RuntimeEvent) => void);
  }
}

export const NodeRuntimeContext = React.createContext<{
  nodeId: NodeId | null;
  nodeName: string | null;
}>({
  nodeId: null,
  nodeName: null,
});
export const CanvasEventsContext = React.createContext<Emitter<RuntimeEvents> | null>(null);

export interface NodeErrorProps {
  error: RuntimeError;
}

export interface NodeRuntimeWrapperProps {
  children: React.ReactElement;
  nodeId: NodeId;
  nodeName: string;
  NodeError: React.ComponentType<NodeErrorProps>;
}

export function NodeRuntimeWrapper({
  nodeId,
  nodeName,
  children,
  NodeError,
}: NodeRuntimeWrapperProps) {
  const resetNodeErrorsKey = React.useContext(ResetNodeErrorsKeyContext);

  const ErrorFallback = React.useCallback(
    ({ error }: FallbackProps) => <NodeError error={error} />,
    [NodeError],
  );

  const nodeRuntimeValue = React.useMemo(() => ({ nodeId, nodeName }), [nodeId, nodeName]);

  return (
    <ErrorBoundary resetKeys={[resetNodeErrorsKey]} fallbackRender={ErrorFallback}>
      <NodeRuntimeContext.Provider value={nodeRuntimeValue}>{children}</NodeRuntimeContext.Provider>
    </ErrorBoundary>
  );
}

export interface NodeRuntime<P> {
  nodeId: string | null;
  nodeName: string | null;
  updateAppDomConstProp: <K extends keyof P & string>(
    key: K,
    value: React.SetStateAction<P[K]>,
  ) => void;
  updateEditorNodeData: (key: string, value: any) => void;
}

export function useNode<P = {}>(): NodeRuntime<P> | null {
  const { nodeId, nodeName } = React.useContext(NodeRuntimeContext);
  const canvasEvents = React.useContext(CanvasEventsContext);

  return React.useMemo(() => {
    if (!nodeId || !canvasEvents) {
      return null;
    }
    const nodeRuntime: NodeRuntime<P> = {
      nodeId,
      nodeName,
      updateAppDomConstProp: (prop, value) => {
        canvasEvents.emit('propUpdated', {
          nodeId,
          prop,
          value,
        });
      },
      updateEditorNodeData: (prop: string, value: any) => {
        canvasEvents.emit('editorNodeDataUpdated', {
          nodeId,
          prop,
          value,
        });
      },
    };

    return nodeRuntime;
  }, [canvasEvents, nodeId, nodeName]);
}

export interface PlaceholderProps {
  prop: string;
  children?: React.ReactNode;
}

export function Placeholder({ prop, children }: PlaceholderProps) {
  const { nodeId } = React.useContext(NodeRuntimeContext);
  if (!nodeId) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const count = React.Children.count(children);
  return count > 0 ? (
    <React.Fragment>{children}</React.Fragment>
  ) : (
    <div
      style={{
        minHeight: 72,
        minWidth: 200,
      }}
      data-toolpad-slot-name={prop}
      data-toolpad-slot-parent={nodeId}
      data-toolpad-slot-type="single"
    />
  );
}

export interface SlotsProps {
  prop: string;
  children?: React.ReactNode;
  hasLayout?: boolean;
}

export function Slots({ prop, children, hasLayout = false }: SlotsProps) {
  const { nodeId } = React.useContext(NodeRuntimeContext);
  if (!nodeId) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const count = React.Children.count(children);

  if (count <= 0) {
    return <Placeholder prop={prop} />;
  }

  if (hasLayout) {
    return (
      <Stack
        direction="column"
        sx={{
          gap: 1,
        }}
        data-toolpad-slot-name={prop}
        data-toolpad-slot-parent={nodeId}
        data-toolpad-slot-type="layout"
      >
        {children}
      </Stack>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}

export function isToolpadComponent(
  maybeComponent: unknown,
): maybeComponent is ToolpadComponent<any> {
  if (
    !ReactIs.isValidElementType(maybeComponent) ||
    typeof maybeComponent === 'string' ||
    !hasOwnProperty(maybeComponent, TOOLPAD_COMPONENT)
  ) {
    return false;
  }

  return true;
}

export function getArgTypeDefaultValue<P extends object, K extends keyof P>(
  argType: ArgTypeDefinition<P, K>,
): P[K] | undefined {
  return argType.default ?? argType.defaultValue ?? undefined;
}

export function createToolpadComponentThatThrows(error: Error) {
  return createComponent(() => {
    throw error;
  });
}

const [useComponents, ComponentsContextProvider] =
  createProvidedContext<ToolpadComponents>('Components');

export { useComponents, ComponentsContextProvider };

export function useComponent(id: string) {
  const components = useComponents();
  return React.useMemo(() => {
    return (
      components?.[id] ??
      createToolpadComponentThatThrows(new Error(`Can't find component for "${id}"`))
    );
  }, [components, id]);
}

export interface ToolpadDataProviderIntrospection {
  paginationMode: PaginationMode;
  hasDeleteRecord: boolean;
  hasUpdateRecord: boolean;
  hasCreateRecord: boolean;
}

export interface UseDataProviderHookResult<
  R extends Record<string, unknown>,
  P extends PaginationMode,
> {
  isLoading: boolean;
  error?: unknown;
  dataProvider: ToolpadDataProviderBase<R, P> | null;
}

export interface UseDataProviderHook {
  <R extends Record<string, unknown>, P extends PaginationMode>(
    id: string | null,
  ): UseDataProviderHookResult<R, P>;
}

export const UseDataProviderContext = React.createContext<UseDataProviderHook | null>(null);
