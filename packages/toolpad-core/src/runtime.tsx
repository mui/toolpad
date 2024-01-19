import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Emitter } from '@mui/toolpad-utils/events';
import * as ReactIs from 'react-is';
import { hasOwnProperty } from '@mui/toolpad-utils/collections';
import getComponentDisplayName, {
  createProvidedContext,
  isValidReactNode,
} from '@mui/toolpad-utils/react';
import invariant from 'invariant';
import { Box, Stack } from '@mui/material';
import { RuntimeEvents, ToolpadComponents, ToolpadComponent, ArgTypeDefinition } from './types';
import { TOOLPAD_COMPONENT } from './constants';
import type {
  RuntimeEvent,
  RuntimeError,
  PaginationMode,
  ToolpadDataProviderBase,
  NodeId,
  ComponentConfig,
  PropValueType,
} from './types';

const ResetNodeErrorsKeyContext = React.createContext(0);

export const ResetNodeErrorsKeyProvider = ResetNodeErrorsKeyContext.Provider;

export type Components = ToolpadComponents;

export const ComponentsContext = React.createContext<ToolpadComponents | null>(null);

declare global {
  interface Window {
    __TOOLPAD_RUNTIME_EVENT__?: RuntimeEvent[] | ((event: RuntimeEvent) => void);
  }
}

const NodeRuntimePropsContext = React.createContext<Record<string, unknown>>({});

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
  props: Record<string, unknown>;
  NodeError: React.ComponentType<NodeErrorProps>;
}

export function NodeRuntimeWrapper({
  nodeId,
  nodeName,
  children,
  props,
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
      <NodeRuntimePropsContext.Provider value={props}>
        <NodeRuntimeContext.Provider value={nodeRuntimeValue}>
          {children}
        </NodeRuntimeContext.Provider>
      </NodeRuntimePropsContext.Provider>
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

export function useProp(name: string) {
  const props = React.useContext(NodeRuntimePropsContext);
  return props[name];
}

interface PlaceholderProps {
  prop: string;
  children?: React.ReactNode;
}

function Placeholder({ prop, children }: PlaceholderProps) {
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
}

export function Slots({ prop, children }: SlotsProps) {
  const { nodeId } = React.useContext(NodeRuntimeContext);
  if (!nodeId) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const count = React.Children.count(children);

  if (count <= 0) {
    return <Placeholder prop={prop} />;
  }

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

type MaybeLegacyArgTypeDefinition = ArgTypeDefinition & { typeDef?: PropValueType };

/**
 * Marks the wrapped React component as a Toolpad compatible component.
 * This makes it available in the Toolpad editor.
 * Optionally, you can pass a configuration object to specify the component's argument types.
 * Argument types define the properties that can be set in the Toolpad editor for this component.
 * Additionally, you'll be able to bind page state to these properties.
 * @param Component The React component to wrap.
 * @param config The configuration for the component.
 */
export function createComponent<P extends object>(
  Component: React.ComponentType<P>,
  config?: ComponentConfig<P>,
): ToolpadComponent<P> {
  // TODO: Remove post beta
  if (config?.argTypes) {
    for (const [name, argType] of Object.entries(config.argTypes)) {
      const maybeLegacyArgtype = argType as MaybeLegacyArgTypeDefinition;
      if (maybeLegacyArgtype.typeDef) {
        const componentName = getComponentDisplayName(Component);
        console.warn(
          `Detected deprecated argType definition for "${name}" in the "${componentName}" component.`,
        );
        Object.assign(maybeLegacyArgtype, maybeLegacyArgtype.typeDef);
        delete maybeLegacyArgtype.typeDef;
      }
    }
  }
  return Object.assign(Component, {
    [TOOLPAD_COMPONENT]: config || { argTypes: {} },
  });
}

export interface UnstableSlotProps {
  prop: string;
}

export function UnstableSlot({ prop }: UnstableSlotProps): React.ReactNode {
  const node = useNode();
  invariant(node, 'Slot must be used inside a node');

  const rawContent = useProp(prop);
  const content = isValidReactNode(rawContent) ? rawContent : null;

  if (rawContent && content !== rawContent) {
    console.warn(`Invalid content for slot "${prop}" in "${node.nodeName}"`);
    return null;
  }

  const count = React.Children.count(content);

  return count > 0 ? (
    <React.Fragment>{content}</React.Fragment>
  ) : (
    <Box
      sx={{
        minHeight: 72,
        minWidth: 200,
      }}
      data-toolpad-slot-name={prop}
      data-toolpad-slot-parent={node.nodeId}
      data-toolpad-slot-type="single"
    />
  );
}

export interface UnstableSlotsProps {
  prop: string;
}

export function UnstableSlots({ prop }: UnstableSlotsProps): React.ReactNode {
  const node = useNode();
  invariant(node, 'Slot must be used inside a node');

  const rawContent = useProp(prop);
  const content = isValidReactNode(rawContent) ? rawContent : null;

  if (rawContent && content !== rawContent) {
    console.warn(`Invalid content for slot "${prop}" in "${node.nodeName}"`);
    return null;
  }

  const count = React.Children.count(content);

  if (count <= 0) {
    return <UnstableSlot prop={prop} />;
  }

  return (
    <Box
      sx={{ display: 'contents' }}
      data-toolpad-slot-name={prop}
      data-toolpad-slot-parent={node.nodeId}
      data-toolpad-slot-type="layout"
    >
      {content}
    </Box>
  );
}
