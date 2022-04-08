import * as React from 'react';
import { NoSsr, Stack } from '@mui/material';
import { omit, pick, without } from 'lodash';
import { evalCode, transformQueryResult, UseDataQuery } from '@mui/toolpad-core';
import { ThemeProvider, createTheme, ThemeOptions, PaletteOptions } from '@mui/material/styles';
import * as colors from '@mui/material/colors';
import { useQueries, UseQueryOptions } from 'react-query';
import * as appDom from '../appDom';
import { NodeId, VersionOrPreview } from '../types';
import { createProvidedContext } from '../utils/react';
import { getToolpadComponent } from '../toolpadComponents';
import { ToolpadComponentDefinition } from '../toolpadComponents/componentDefinition';

async function fetchData(dataUrl: string, queryId: string, params: any) {
  const url = new URL(`./${encodeURIComponent(queryId)}`, new URL(dataUrl, window.location.href));
  url.searchParams.set('params', JSON.stringify(params));
  const res = await fetch(String(url));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  return res.json();
}

type NodeState = Record<string, unknown>;
type PageState = Record<string, NodeState | UseDataQuery | undefined>;

interface AppContext {
  appId: string;
  version: VersionOrPreview;
}

const [useAppContext, AppContextProvider] = createProvidedContext<AppContext>('App');
const [useDomContext, DomContextProvider] = createProvidedContext<appDom.AppDom>('Dom');
const [useSetControlledStateContext, SetControlledStateContextProvider] =
  createProvidedContext<React.Dispatch<React.SetStateAction<PageState>>>('SetControlledState');
const [usePageStateContext, PageStateContextProvider] =
  createProvidedContext<PageState>('PagState');

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
  const setControlledState = useSetControlledStateContext();

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
          const value = (pageState[node.name] as NodeState)?.[key];
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
            setControlledState((oldState) => {
              const nodeState = oldState[node.name];
              if (nodeState) {
                return { ...oldState, [node.name]: { ...nodeState, [key]: value } };
              }
              return oldState;
            });
          };
          return [[argType.onChangeProp, handler]];
        }),
      ),
    [argTypes, node.name, setControlledState],
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
  const elements = appDom.getDescendants(dom, page);
  return Object.fromEntries(
    elements.flatMap((elm) => {
      if (appDom.isElement(elm)) {
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
      }
      return [];
    }),
  );
}

function RenderedPage({ nodeId }: RenderedNodeProps) {
  const { appId, version } = useAppContext();
  const dom = useDomContext();
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [], queryStates = [] } = appDom.getChildNodes(dom, page);

  const [controlledState, setControlledState] = React.useState(getInitialPageState(dom, page));

  // Make sure to patch page state when dom nodes are added or removed
  React.useEffect(() => {
    setControlledState((existing) => {
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

  const reactQueries: UseQueryOptions[] = queryStates.map((node) => {
    const dataUrl = `/api/data/${appId}/${version}/`;
    const queryId = node.attributes.api.value;
    // TODO: resolve bindables:
    const params = {};
    return {
      queryKey: [dataUrl, queryId, params],
      queryFn: () => queryId && fetchData(dataUrl, queryId, params),
      enabled: !!queryId,
    };
  });

  const queryResults = useQueries(reactQueries);

  const pageState = React.useMemo(() => {
    const queryResultState = Object.fromEntries(
      queryStates.map((node, i) => {
        const queryResult = queryResults[i];
        return [node.name, transformQueryResult(queryResult)];
      }),
    );

    return { ...queryResultState, ...controlledState };
  }, [queryStates, controlledState, queryResults]);

  return (
    <SetControlledStateContextProvider value={setControlledState}>
      <PageStateContextProvider value={pageState}>
        <Stack direction="column" alignItems="stretch" sx={{ my: 2 }}>
          {children.map((child) => (
            <RenderedNode key={child.id} nodeId={child.id} />
          ))}
        </Stack>
      </PageStateContextProvider>
    </SetControlledStateContextProvider>
  );
}

function createThemeoptions(themeNode: appDom.ThemeNode): ThemeOptions {
  const palette: PaletteOptions = {};
  const primary = appDom.fromConstPropValue(themeNode.theme['palette.primary.main']);
  if (primary) {
    palette.primary = (colors as any)[primary];
  }

  const secondary = appDom.fromConstPropValue(themeNode.theme['palette.secondary.main']);
  if (secondary) {
    palette.secondary = (colors as any)[secondary];
  }

  return createTheme({ palette });
}

export interface ToolpadAppProps {
  appId: string;
  version: VersionOrPreview;
  dom: appDom.AppDom;
}

export default function ToolpadApp({ appId, version, dom }: ToolpadAppProps) {
  const root = appDom.getApp(dom);
  const { pages = [], themes = [] } = appDom.getChildNodes(dom, root);

  const toolpadTheme = themes.length > 0 ? themes[0] : null;
  const theme = React.useMemo(() => {
    const options = toolpadTheme ? createThemeoptions(toolpadTheme) : {};
    return createTheme(options);
  }, [toolpadTheme]);

  const appContext = React.useMemo(() => ({ appId, version }), [appId, version]);

  return (
    // evaluation bindings run in an iframe so NoSsr for now
    <NoSsr>
      <AppContextProvider value={appContext}>
        <ThemeProvider theme={createTheme(theme)}>
          <DomContextProvider value={dom}>
            {pages.length > 0 ? <RenderedPage nodeId={pages[0].id} /> : null}
          </DomContextProvider>
        </ThemeProvider>
      </AppContextProvider>
    </NoSsr>
  );
}
