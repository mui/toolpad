import * as React from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import {
  RUNTIME_PROP_NODE_ERROR,
  RUNTIME_PROP_NODE_ID,
  RUNTIME_PROP_STUDIO_SLOTS,
  RUNTIME_PROP_STUDIO_SLOTS_TYPE,
} from './constants.js';
import type { SlotType } from './index';

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

export interface RuntimeError {
  message: string;
  stack?: string;
}

interface ComponentErrorBoundaryProps {
  children?: React.ReactNode;
  nodeId: string;
}

interface ComponentErrorBoundaryState {
  error: RuntimeError | null;
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

  static getDerivedStateFromError(error: Error): ComponentErrorBoundaryState {
    return { error: { message: error.message, stack: error.stack } };
  }

  render() {
    if (this.state.error) {
      return (
        <span
          {...{
            [RUNTIME_PROP_NODE_ID]: this.props.nodeId,
            [RUNTIME_PROP_NODE_ERROR]: this.state.error,
          }}
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
      );
    }

    return this.props.children;
  }
}

export interface RuntimeStudioNodeProps {
  children: React.ReactElement;
  id: string;
}

// We will use [RUNTIME_PROP_NODE_ID] while walking the fibers to detect React Elements that
// represent StudioNodes
export function RuntimeStudioNode({ children, id }: RuntimeStudioNodeProps) {
  return (
    <StudioNodeContext.Provider value={id}>
      <ComponentErrorBoundary nodeId={id}>
        {React.cloneElement(children, { [RUNTIME_PROP_NODE_ID]: id })}
      </ComponentErrorBoundary>
    </StudioNodeContext.Provider>
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
