import { Box } from '@mui/material';
import * as React from 'react';
import {
  DEFINITION_KEY,
  RUNTIME_PROP_NODE_ID,
  RUNTIME_PROP_STUDIO_SLOTS,
  RUNTIME_PROP_STUDIO_SLOTS_TYPE,
} from './constants.js';
import type { ComponentDefinition, SlotType } from './index';

export const StudioNodeContext = React.createContext<string | null>(null);

// NOTE: These props aren't used, they are only there to transfer information from the
// React elements to the fibers.
export interface SlotsInternalProps {
  children?: React.ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_STUDIO_SLOTS]: string;
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: SlotType;
  // eslint-disable-next-line react/no-unused-prop-types
  parentId: string;
}

export function SlotsInternal({ children }: SlotsInternalProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

export interface PlaceholderInternalProps {
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_STUDIO_SLOTS]: string;
  // eslint-disable-next-line react/no-unused-prop-types
  parentId: string;
}

// We want typescript to enforce these props, even when they're not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PlaceholderInternal(props: PlaceholderInternalProps) {
  return (
    <div
      style={{
        display: 'block',
        minHeight: 40,
        minWidth: 200,
      }}
    />
  );
}

interface ComponentErrorBoundaryProps {
  children?: React.ReactNode;
}
interface ComponentErrorBoundaryState {
  error: { message: string } | null;
}

class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  state: ComponentErrorBoundaryState;

  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error: { message: error.message } };
  }

  componentDidUpdate(
    prevProps: ComponentErrorBoundaryProps,
    prevState: ComponentErrorBoundaryState,
  ) {
    if (prevState.error && !this.state.error) {
      // TODO: signal the editor that the error has disappeared
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: signal the editor that an error has appeared
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{ width: 60, height: 40, background: 'red', pointerEvents: 'initial' }}
          title={this.state.error.message}
        />
      );
    }

    return this.props.children;
  }
}

interface WrappedStudioNodeInternalProps {
  children: React.ReactElement;
  [RUNTIME_PROP_NODE_ID]: string;
}

// We will use [RUNTIME_PROP_NODE_ID] while walking the fibers to detect elements of this type
// We will wrap any slot/slots props with elements that have a [RUNTIME_PROP_STUDIO_SLOTS] so
// that we can detect these as well in the fibers.
function WrappedStudioNodeInternal({
  children,
  [RUNTIME_PROP_NODE_ID]: studioNodeId,
}: WrappedStudioNodeInternalProps) {
  const child = React.Children.only(children);
  const definition = (child.type as any)[DEFINITION_KEY] as ComponentDefinition<any> | undefined;

  let newProps: { [key: string]: unknown } | undefined;

  Object.entries(definition?.argTypes || {}).forEach(([argName, argDef]) => {
    const value = child.props[argName];
    if (argDef?.typeDef.type === 'element') {
      if (argDef.control?.type === 'slots') {
        const valueAsArray = React.Children.toArray(value);
        newProps = newProps ?? {};
        newProps[argName] =
          valueAsArray.length > 0 ? (
            <SlotsInternal
              {...{
                [RUNTIME_PROP_STUDIO_SLOTS]: argName,
                [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'multiple',
              }}
              parentId={studioNodeId}
            >
              {valueAsArray}
            </SlotsInternal>
          ) : (
            <PlaceholderInternal
              {...{
                [RUNTIME_PROP_STUDIO_SLOTS]: argName,
                [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'single',
              }}
              parentId={studioNodeId}
            />
          );
      } else if (argDef.control?.type === 'slot') {
        const valueAsArray = React.Children.toArray(value);
        if (valueAsArray.length <= 0) {
          newProps = newProps ?? {};
          newProps[argName] = (
            <PlaceholderInternal
              {...{
                [RUNTIME_PROP_STUDIO_SLOTS]: argName,
                [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'single',
              }}
              parentId={studioNodeId}
            />
          );
        }
      }
    }
  });

  return (
    <StudioNodeContext.Provider value={studioNodeId}>
      <ComponentErrorBoundary>
        {newProps ? React.cloneElement(child, newProps) : child}
      </ComponentErrorBoundary>
    </StudioNodeContext.Provider>
  );
}

export interface WrappedStudioNodeProps {
  children: React.ReactElement;
  id: string;
}

// Public interface with an `id` prop that will translate it into [RUNTIME_PROP_NODE_ID]
export function WrappedStudioNode({ children, id }: WrappedStudioNodeProps) {
  return (
    <WrappedStudioNodeInternal {...{ [RUNTIME_PROP_NODE_ID]: id }}>
      {children}
    </WrappedStudioNodeInternal>
  );
}

export interface StudioRuntimeNode<P> {
  setProp: <K extends keyof P>(key: K, value: P[K] | ((newValue: P[K]) => P[K])) => void;
}

export function useStudioNode<P = {}>(): StudioRuntimeNode<P> | null {
  const nodeId = React.useContext(StudioNodeContext);

  return React.useMemo(() => {
    if (!nodeId) {
      return null;
    }
    return {
      setProp: (prop, value) => {
        window.parent.postMessage({
          type: 'setProp',
          nodeId,
          prop,
          value,
        });
        console.log(`setting prop "${prop}" to "${value}" on node "${nodeId}"`);
      },
    };
  }, [nodeId]);
}

export interface PlaceholderProps {
  prop: string;
  children?: React.ReactNode;
}

export function Placeholder({ prop, children }: PlaceholderProps) {
  const nodeId = React.useContext(StudioNodeContext);
  if (!nodeId) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const count = React.Children.count(children);
  return count > 0 ? (
    <React.Fragment>{children}</React.Fragment>
  ) : (
    <PlaceholderInternal
      parentId={nodeId}
      {...{
        [RUNTIME_PROP_STUDIO_SLOTS]: prop,
        [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'single',
      }}
    />
  );
}

export interface SlotsProps {
  prop: string;
  children?: React.ReactNode;
}

export function Slots({ prop, children }: SlotsProps) {
  const nodeId = React.useContext(StudioNodeContext);
  if (!nodeId) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const count = React.Children.count(children);
  return count > 0 ? (
    <SlotsInternal
      parentId={nodeId}
      {...{
        [RUNTIME_PROP_STUDIO_SLOTS]: prop,
        [RUNTIME_PROP_STUDIO_SLOTS_TYPE]: 'multiple',
      }}
    >
      {children}
    </SlotsInternal>
  ) : (
    <Placeholder prop={prop} />
  );
}
