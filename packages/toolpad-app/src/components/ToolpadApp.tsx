import * as React from 'react';
import { NoSsr, Stack } from '@mui/material';
import { omit, pick, without } from 'lodash';
import { evalCode } from '@mui/toolpad-core';
import * as appDom from '../appDom';
import { NodeId } from '../types';
import { createProvidedContext } from '../utils/react';
import { getToolpadComponent } from '../toolpadComponents';
import { ToolpadComponentDefinition } from '../toolpadComponents/componentDefinition';

type NodeState = Record<string, unknown>;
type PageState = Record<string, NodeState | undefined>;

const [useDomContext, DomContextProvider] = createProvidedContext<appDom.AppDom>('Dom');
const [usePageStateContext, PageStateContextProvider] =
  createProvidedContext<PageState>('PagState');
const [useSetPageStateContext, SetPageStateContextProvider] =
  createProvidedContext<React.Dispatch<React.SetStateAction<PageState>>>('SetPagState');

function getElmToolpadComponent(
  dom: appDom.AppDom,
  elm: appDom.ElementNode,
): ToolpadComponentDefinition {
  return getToolpadComponent(dom, elm.attributes.component.value);
}

interface RenderedNodeProps {
  nodeId: NodeId;
}

function RenderedNode({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const pageState = usePageStateContext();
  const setPageState = useSetPageStateContext();

  const node = appDom.getNode(dom, nodeId, 'element');
  const { children = [] } = appDom.getChildNodes(dom, node);
  const { Component, argTypes } = getElmToolpadComponent(dom, node);

  const constProps = React.useMemo(
    () =>
      node.props
        ? Object.fromEntries(
            Object.entries(node.props)
              .filter(([, value]) => value?.type === 'const')
              .map(([key, value]) => [key, value?.value]),
          )
        : {},
    [node.props],
  );

  const boundProps = React.useMemo(
    () =>
      node.props
        ? Object.fromEntries(
            Object.entries(node.props)
              .filter(([, value]) => value?.type === 'jsExpression')
              .flatMap(([key, value]) => {
                try {
                  const result = evalCode(value?.value, pageState);
                  return [[key, result]];
                } catch (err) {
                  console.error(`Oh no`, err);
                  return [];
                }
              }),
          )
        : {},
    [node.props, pageState],
  );

  const controlledProps = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(argTypes).flatMap(([key, argType]) => {
          if (!argType || !argType.onChangeProp) {
            return [];
          }
          const value = pageState[node.name]?.[key];
          return [[key, value]];
        }),
      ),
    [argTypes, node.name, pageState],
  );

  const onChangeHandlers = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(argTypes).flatMap(([key, argType]) => {
          if (!argType || !argType.onChangeProp) {
            return [];
          }
          const valueGetter = argType.onChangeHandler
            ? new Function(
                ...argType.onChangeHandler.params,
                `return ${argType.onChangeHandler.valueGetter}`,
              )
            : (value: any) => value;
          const handler = (param: any) => {
            const value = valueGetter(param);
            setPageState((oldPageState) => {
              const nodeState = oldPageState[node.name];
              if (nodeState) {
                return { ...oldPageState, [node.name]: { ...nodeState, [key]: value } };
              }
              return oldPageState;
            });
          };
          return [[argType.onChangeProp, handler]];
        }),
      ),
    [argTypes, node.name, setPageState],
  );

  const reactChildren =
    children.length > 0
      ? children.map((child) => <RenderedNode key={child.id} nodeId={child.id} />)
      : // `undefined` to ensure the defaultProps get picked up
        undefined;

  const props = {
    children: reactChildren,
    ...constProps,
    ...boundProps,
    ...controlledProps,
    ...onChangeHandlers,
  };

  return <Component {...props} />;
}

function getInitialPageState(dom: appDom.AppDom, page: appDom.PageNode): PageState {
  const elements = appDom.getDescendants(dom, page) as appDom.ElementNode[];
  return Object.fromEntries(
    elements.flatMap((elm) => {
      if (!appDom.isElement(elm)) {
        return [];
      }
      const { argTypes, Component } = getElmToolpadComponent(dom, elm);
      return [
        [
          elm.name,
          Object.fromEntries(
            Object.entries(argTypes).flatMap(([key, argType]) => {
              if (!argType || !argType.onChangeProp) {
                return [];
              }
              const defaultValue = Component.defaultProps?.[key];
              return [[key, defaultValue]];
            }),
          ),
        ],
      ];
    }),
  );
}

function RenderedPage({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [] } = appDom.getChildNodes(dom, page);

  const [pageState, setPageState] = React.useState(getInitialPageState(dom, page));
  // Make sure to patch page state when dom nodes are added or removed
  React.useEffect(() => {
    setPageState((existing) => {
      const initial = getInitialPageState(dom, page);
      const existingKeys = Object.keys(existing);
      const initialKeys = Object.keys(initial);
      const newInitial = without(initialKeys, ...existingKeys);
      const oldExisting = without(existingKeys, ...initialKeys);
      if (newInitial.length > 0 || oldExisting.length > 0) {
        return { ...omit(existing, ...oldExisting), ...pick(initial, ...newInitial) };
      }
      return existing;
    });
  }, [dom, page]);

  return (
    <SetPageStateContextProvider value={setPageState}>
      <PageStateContextProvider value={pageState}>
        <Stack direction="column" alignItems="stretch" sx={{ my: 2 }}>
          {children.map((child) => (
            <RenderedNode key={child.id} nodeId={child.id} />
          ))}
        </Stack>
      </PageStateContextProvider>
    </SetPageStateContextProvider>
  );
}

export interface ToolpadAppProps {
  dom: appDom.AppDom;
}

export default function ToolpadApp({ dom }: ToolpadAppProps) {
  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);

  return (
    // evaluation bindings run in an iframe so NoSsr for now
    <NoSsr>
      <DomContextProvider value={dom}>
        {pages.length > 0 ? <RenderedPage nodeId={pages[0].id} /> : null}
      </DomContextProvider>
    </NoSsr>
  );
}
