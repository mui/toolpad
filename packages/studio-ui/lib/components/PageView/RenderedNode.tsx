import * as React from 'react';
import {
  NodeId,
  StudioComponentDefinition,
  StudioComponentPropDefinitions,
  StudioNodeProps,
} from '../../types';
import { getStudioComponent } from '../../studioComponents';
import { PageStateObservable, usePageStateObservable } from '../PageStateProvider';
import { getNode } from '../../studioPage';
import { ExactEntriesOf } from '../../utils/types';
import NodeContext from './NodeContext';
import { useCurrentPage } from './PageContext';
import { DATA_PROP_NODE_ID } from './contants';

function getDefaultPropValues<P = {}>(definition: StudioComponentDefinition<P>): Partial<P> {
  const result: Partial<P> = {};
  const entries = Object.entries(definition.props) as ExactEntriesOf<
    StudioComponentPropDefinitions<P>
  >;
  entries.forEach(([name, prop]) => {
    if (prop) {
      result[name] = prop.defaultValue;
    }
  });

  return result;
}

function getCurrentBoundProps<P>(
  nodeProps: StudioNodeProps<P>,
  stateObservable: PageStateObservable,
  definition: StudioComponentDefinition<P>,
): Record<string, unknown> {
  if (!definition) {
    return {};
  }
  const props = Object.fromEntries(
    (Object.entries(nodeProps) as ExactEntriesOf<StudioNodeProps<P>>).flatMap(
      ([propName, prop]) => {
        if (prop?.type !== 'binding') {
          return [];
        }
        const result = [[propName, stateObservable.getValue(prop.state)]];

        const propDef = definition.props[propName];
        if (propDef?.onChangeProp) {
          const onChange = (...args: any[]) => {
            const newValue = propDef.onChangeTransform
              ? propDef.onChangeTransform(...args)
              : args[0];

            stateObservable.setValue(prop.state, newValue);
          };
          result.push([propDef.onChangeProp, onChange]);
        }

        return result;
      },
    ),
  );

  return props;
}

function getConstProps<P>(props: StudioNodeProps<P>): Record<string, unknown> {
  return Object.fromEntries(
    (Object.entries(props) as ExactEntriesOf<StudioNodeProps<P>>).flatMap(([name, prop]) =>
      prop?.type === 'const' ? [[name, prop.value]] : [],
    ),
  );
}

interface RenderedNodeProps {
  nodeId: NodeId;
}

export default function RenderedNode<P>({ nodeId }: RenderedNodeProps) {
  const page = useCurrentPage();
  const node = getNode(page, nodeId);

  const definition = getStudioComponent(node.component);

  const stateObservable = usePageStateObservable();
  const [boundProps, setBoundProps] = React.useState<Record<string, any>>(
    getCurrentBoundProps(node.props, stateObservable, definition),
  );

  const defaultProps = React.useMemo(() => getDefaultPropValues(definition), [definition]);

  const constProps = React.useMemo(() => getConstProps(node.props), [node.props]);

  React.useEffect(() => {
    setBoundProps(getCurrentBoundProps(node.props, stateObservable, definition));
  }, [node.props, stateObservable, definition]);

  React.useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    (Object.entries(node.props) as ExactEntriesOf<StudioNodeProps<P>>).forEach(
      ([propName, prop]) => {
        if (prop?.type === 'binding') {
          const unsubscribe = stateObservable.subscribe(prop.state, () => {
            setBoundProps((props) => ({
              ...props,
              [propName]: stateObservable.getValue(prop.state),
            }));
          });
          unsubscribes.push(unsubscribe);
        }
      },
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [node, stateObservable]);

  if (!definition) {
    return null;
  }

  const componentProps: Record<string, unknown> = {
    ...defaultProps,
    ...constProps,
    ...boundProps,
    [DATA_PROP_NODE_ID]: node.id,
  };

  return (
    <NodeContext.Provider value={node}>
      <definition.Component {...componentProps}>{node.children}</definition.Component>
    </NodeContext.Provider>
  );
}
