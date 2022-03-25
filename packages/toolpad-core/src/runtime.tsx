import * as React from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import { RUNTIME_PROP_NODE_ID, RUNTIME_PROP_STUDIO_SLOTS } from './constants.js';
import type { SlotType, LiveBindings, ComponentConfig, RuntimeEvent } from './index';

declare global {
  interface Window {
    __STUDIO_RUNTIME_PAGE_STATE__?: Record<string, unknown>;
    __STUDIO_RUNTIME_BINDINGS_STATE__?: LiveBindings;
    __STUDIO_RUNTIME_EVENT__?: RuntimeEvent[] | ((event: RuntimeEvent) => void);
  }
}

export const StudioNodeContext = React.createContext<string | null>(null);

// NOTE: These props aren't used, they are only there to transfer information from the
// React elements to the fibers.
interface SlotsWrapperProps {
  children?: React.ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  [RUNTIME_PROP_STUDIO_SLOTS]: string;
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
  [RUNTIME_PROP_STUDIO_SLOTS]: string;
  // eslint-disable-next-line react/no-unused-prop-types
  parentId: string;
}

// We want typescript to enforce these props, even when they're not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PlaceholderWrapper(props: PlaceholderWrapperProps) {
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

export interface RuntimeStudioNodeProps {
  children: React.ReactElement;
  nodeId: string;
}

interface RuntimeStudioNodeState {
  error: RuntimeError | null;
}

interface RuntimeNodeWrapperProps {
  children: React.ReactElement;
  [RUNTIME_PROP_NODE_ID]: string;
  nodeError?: RuntimeError;
}

// We will use [RUNTIME_PROP_NODE_ID] while walking the fibers to detect React Elements that
// represent StudioNodes. We use a wrapper to ensure only one element exists in the React tree
// that has [RUNTIME_PROP_NODE_ID] property with this nodeId (We could clone the child and add
// the prop, but the child may be spreading its props to other elements). We also don't want this
// property to end up on DOM nodes.
// IMPORTANT! This node must directly wrap the React Element for the studioNode
function RuntimeNodeWrapper({ children }: RuntimeNodeWrapperProps) {
  return children;
}

export class RuntimeStudioNode extends React.Component<
  RuntimeStudioNodeProps,
  RuntimeStudioNodeState
> {
  state: RuntimeStudioNodeState;

  constructor(props: RuntimeStudioNodeProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): RuntimeStudioNodeState {
    return { error: { message: error.message, stack: error.stack } };
  }

  render() {
    if (this.state.error) {
      return (
        <RuntimeNodeWrapper
          {...{
            [RUNTIME_PROP_NODE_ID]: this.props.nodeId,
            nodeError: this.state.error,
          }}
        >
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
        </RuntimeNodeWrapper>
      );
    }

    return (
      <StudioNodeContext.Provider value={this.props.nodeId}>
        <RuntimeNodeWrapper {...{ [RUNTIME_PROP_NODE_ID]: this.props.nodeId }}>
          {this.props.children}
        </RuntimeNodeWrapper>
      </StudioNodeContext.Provider>
    );
  }
}

export function useDiagnostics(
  pageState: Record<string, unknown>,
  liveBindings: LiveBindings,
): void {
  // Layout effect to make sure it's updated before the DOM is updated (which triggers the editor
  // to update its view state).
  React.useLayoutEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__STUDIO_RUNTIME_PAGE_STATE__ = pageState;
    // eslint-disable-next-line no-underscore-dangle
    window.__STUDIO_RUNTIME_BINDINGS_STATE__ = liveBindings;
  }, [pageState, liveBindings]);
}

export interface StudioRuntimeNode<P> {
  setProp: <K extends keyof P & string>(key: K, value: React.SetStateAction<P[K]>) => void;
}

export function useStudioNode<P = {}>(): StudioRuntimeNode<P> | null {
  const nodeId = React.useContext(StudioNodeContext);

  return React.useMemo(() => {
    if (!nodeId) {
      return null;
    }
    const fireEvent = (event: RuntimeEvent) => {
      // eslint-disable-next-line no-underscore-dangle
      if (!window.__STUDIO_RUNTIME_EVENT__) {
        // eslint-disable-next-line no-underscore-dangle
        window.__STUDIO_RUNTIME_EVENT__ = [] as RuntimeEvent[];
      }
      // eslint-disable-next-line no-underscore-dangle
      if (typeof window.__STUDIO_RUNTIME_EVENT__ === 'function') {
        // eslint-disable-next-line no-underscore-dangle
        window.__STUDIO_RUNTIME_EVENT__(event);
      } else {
        // eslint-disable-next-line no-underscore-dangle
        window.__STUDIO_RUNTIME_EVENT__.push(event);
      }
    };
    return {
      setProp: (prop, value) => {
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
    <PlaceholderWrapper
      parentId={nodeId}
      {...{
        [RUNTIME_PROP_STUDIO_SLOTS]: prop,
        slotType: 'single',
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
    <SlotsWrapper
      parentId={nodeId}
      {...{
        [RUNTIME_PROP_STUDIO_SLOTS]: prop,
        slotType: 'multiple',
      }}
    >
      {children}
    </SlotsWrapper>
  ) : (
    <Placeholder prop={prop} />
  );
}

export async function importCodeComponent<P>(
  module: Promise<{ default: React.FC<P> | React.Component<P>; config?: ComponentConfig<P> }>,
): Promise<React.FC<P> | React.Component<P>> {
  const { default: Component, config } = await module;
  // eslint-disable-next-line no-underscore-dangle
  (Component as any).__config = config;
  return Component;
}
