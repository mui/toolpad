import * as React from 'react';
import { ButtonProps, Stack, CssBaseline } from '@mui/material';
import { omit, pick, without } from 'lodash';
import {
  ArgTypeDefinitions,
  evalCode,
  INITIAL_DATA_QUERY,
  LiveBinding,
  LiveBindings,
  transformQueryResult,
  UseDataQuery,
} from '@mui/toolpad-core';
import { useQueries, UseQueryOptions, QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import * as appDom from '../../src/appDom';
import { BindableAttrValue, BindableAttrValues, NodeId, VersionOrPreview } from '../../src/types';
import { createProvidedContext } from '../../src/utils/react';
import AppOverview from '../../src/components/AppOverview';
import {
  InstantiatedComponent,
  InstantiatedComponents,
} from '../../src/toolpadComponents/componentDefinition';
import AppThemeProvider from './AppThemeProvider';
import { fireEvent } from '../coreRuntime';

export interface RenderToolpadComponentParams {
  Component: React.ComponentType;
  props: any;
  node: appDom.AppDomNode;
  argTypes: ArgTypeDefinitions;
}

function defaultRenderToolpadComponent({ Component, props }: RenderToolpadComponentParams) {
  return <Component {...props} />;
}
type NodeState = Record<string, unknown>;
type ControlledState = Record<string, NodeState | undefined>;
type DataQueryState = Record<string, UseDataQuery | undefined>;
type PageState = Record<string, Record<string, string> | NodeState | UseDataQuery | undefined>;

interface AppContext {
  appId: string;
  version: VersionOrPreview;
}

const RenderToolpadComponentContext = React.createContext(defaultRenderToolpadComponent);
const [useComponentsContext, ComponentsContextProvider] =
  createProvidedContext<InstantiatedComponents>('Components');
const [useAppContext, AppContextProvider] = createProvidedContext<AppContext>('App');
const [useDomContext, DomContextProvider] = createProvidedContext<appDom.AppDom>('Dom');
const [useBindingsContext, BindingsContextProvider] =
  createProvidedContext<LiveBindings>('LiveBindings');
const [useSetControlledStateContext, SetControlledStateContextProvider] =
  createProvidedContext<React.Dispatch<React.SetStateAction<ControlledState>>>(
    'SetControlledState',
  );
const [usePageStateContext, PageStateContextProvider] =
  createProvidedContext<PageState>('PagState');

async function fetchData(dataUrl: string, queryId: string, params: any) {
  const url = new URL(`./${encodeURIComponent(queryId)}`, new URL(dataUrl, window.location.href));
  url.searchParams.set('params', JSON.stringify(params));
  const res = await fetch(String(url));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  return res.json();
}

function getElmComponent(
  components: InstantiatedComponents,
  elm: appDom.ElementNode,
): InstantiatedComponent {
  const componentId = elm.attributes.component.value;
  const component = components[componentId];
  if (!component) {
    throw new Error(`Rendering unknown component "${componentId}"`);
  }
  return component;
}

function useElmToolpadComponent(elm: appDom.ElementNode): InstantiatedComponent {
  const components = useComponentsContext();
  return getElmComponent(components, elm);
}

function resolveBindable<V>(bindable: BindableAttrValue<V>, pageState: PageState): LiveBinding {
  if (bindable?.type === 'jsExpression') {
    try {
      const value = evalCode(bindable?.value, pageState);
      return { value };
    } catch (err) {
      console.error(`Oh no`, err);
      return { error: err as Error };
    }
  }

  if (bindable?.type === 'const') {
    return { value: bindable?.value };
  }

  return { value: undefined };
}

function resolveBindables(
  bindables: BindableAttrValues<any>,
  pageState: PageState,
): Record<string, LiveBinding> {
  return Object.fromEntries(
    Object.entries(bindables).flatMap(([key, bindable]) => {
      if (!bindable) {
        return [];
      }
      const liveBinding = resolveBindable(bindable, pageState);
      return bindable === undefined ? [] : [[key, liveBinding]];
    }),
  );
}

interface RenderedNodeProps {
  nodeId: NodeId;
}

function RenderedNode({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const pageState = usePageStateContext();
  const setControlledState = useSetControlledStateContext();
  const renderToolpadComponent = React.useContext(RenderToolpadComponentContext);

  const node = appDom.getNode(dom, nodeId, 'element');
  const { children = [] } = appDom.getChildNodes(dom, node);
  const { Component, argTypes } = useElmToolpadComponent(node);

  const liveBindings = useBindingsContext();

  const boundProps = React.useMemo(
    () =>
      node.props
        ? Object.fromEntries(
            Object.keys(node.props).map((propName) => [
              propName,
              liveBindings[`${node.id}.props.${propName}`]?.value,
            ]),
          )
        : {},
    [node, liveBindings],
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
    ...boundProps,
    ...controlledProps,
    ...onChangeHandlers,
  };

  return renderToolpadComponent({
    Component,
    props,
    node,
    argTypes,
  });
}

function useInitialControlledState(dom: appDom.AppDom, page: appDom.PageNode): ControlledState {
  const components = useComponentsContext();
  return React.useMemo(() => {
    const elements = appDom.getDescendants(dom, page);
    return Object.fromEntries(
      elements.flatMap((elm) => {
        if (appDom.isElement(elm)) {
          const { argTypes, Component } = getElmComponent(components, elm);
          return [
            [
              elm.name,
              Object.fromEntries(
                Object.entries(argTypes).flatMap(([key, argType]) => {
                  if (!argType || !argType.onChangeProp) {
                    return [];
                  }

                  const defaultValue =
                    elm.props?.[key]?.type === 'const'
                      ? elm.props?.[key]?.value
                      : Component.defaultProps?.[key];

                  return [[key, defaultValue]];
                }),
              ),
            ],
          ];
        }
        return [];
      }),
    );
  }, [dom, page, components]);
}

function getInitialQueryState(dom: appDom.AppDom, page: appDom.PageNode): DataQueryState {
  const elements = appDom.getDescendants(dom, page);
  return Object.fromEntries(
    elements.flatMap((elm) => {
      return appDom.isQueryState(elm) ? [[elm.name, INITIAL_DATA_QUERY]] : [];
    }),
  );
}

function createPageState(
  urlQueryState: Record<string, string>,
  controlledState: ControlledState,
  dataQueryState: DataQueryState,
): PageState {
  return {
    page: urlQueryState,
    ...controlledState,
    ...dataQueryState,
  };
}

interface PageRootProps {
  children?: React.ReactNode;
}

function PageRoot({ children }: PageRootProps) {
  return (
    <Stack direction="column" alignItems="stretch" sx={{ my: 2 }}>
      {children}
    </Stack>
  );
}

function useLiveBindings(
  dom: appDom.AppDom,
  page: appDom.PageNode,
  currentPageState: PageState,
): LiveBindings {
  return React.useMemo(() => {
    const descendants = appDom.getDescendants(dom, page);
    const bindings: LiveBindings = {};
    descendants.forEach((descendant) => {
      if (appDom.isElement(descendant)) {
        if (descendant.props) {
          const elmBindables = resolveBindables(descendant.props, currentPageState);
          Object.entries(elmBindables).forEach(([propName, bindable]) => {
            bindings[`${descendant.id}.props.${propName}`] = bindable;
          });
        }
      } else if (appDom.isQueryState(descendant)) {
        if (descendant.params) {
          const elmBindables = resolveBindables(descendant.params, currentPageState);
          Object.entries(elmBindables).forEach(([propName, bindable]) => {
            bindings[`${descendant.id}.params.${propName}`] = bindable;
          });
        }
      }
    });
    return bindings;
  }, [currentPageState, dom, page]);
}

function RenderedPage({ nodeId }: RenderedNodeProps) {
  const { appId, version } = useAppContext();
  const renderToolpadComponent = React.useContext(RenderToolpadComponentContext);
  const dom = useDomContext();
  const location = useLocation();
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [], queryStates = [] } = appDom.getChildNodes(dom, page);

  const urlQueryState = React.useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    return Object.fromEntries(
      Object.entries(page.attributes.urlQuery.value).map(([key, defaultValue]) => {
        return [key, urlParams.get(key) ?? defaultValue];
      }),
    );
  }, [location.search, page.attributes.urlQuery.value]);

  const initialControlledState = useInitialControlledState(dom, page);
  const [controlledState, setControlledState] = React.useState(initialControlledState);
  const prevPageState = React.useRef<PageState>(
    createPageState(urlQueryState, initialControlledState, getInitialQueryState(dom, page)),
  );

  // Make sure to patch page state when dom nodes are added or removed
  React.useEffect(() => {
    setControlledState((existing) => {
      const existingKeys = Object.keys(existing);
      const initialKeys = Object.keys(initialControlledState);
      const newInitial = without(initialKeys, ...existingKeys);
      const oldExisting = without(existingKeys, ...initialKeys);
      if (newInitial.length > 0 || oldExisting.length > 0) {
        return {
          ...omit(existing, ...oldExisting),
          ...pick(initialControlledState, ...newInitial),
        };
      }
      return existing;
    });
  }, [initialControlledState]);

  const tmpLiveBindings: LiveBindings = useLiveBindings(dom, page, {
    ...prevPageState.current,
    ...controlledState,
  });

  const reactQueries: UseQueryOptions[] = queryStates.map((node) => {
    const dataUrl = `/api/data/${appId}/${version}/`;
    const queryId = node.attributes.api.value;
    const params = node.params
      ? Object.keys(node.params).map((propName) => [
          propName,
          tmpLiveBindings[`${node.id}.params.${propName}`]?.value,
        ])
      : {};
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

    return createPageState(urlQueryState, controlledState, queryResultState);
  }, [urlQueryState, queryStates, controlledState, queryResults]);

  const liveBindings: LiveBindings = useLiveBindings(dom, page, pageState);

  React.useEffect(() => {
    fireEvent({ type: 'pageStateUpdated', pageState });
    prevPageState.current = pageState;
  }, [pageState]);

  React.useEffect(() => {
    fireEvent({ type: 'pageBindingsUpdated', bindings: liveBindings });
  }, [liveBindings]);

  const renderedPageContent = renderToolpadComponent({
    node: page,
    Component: PageRoot,
    props: { children: children.map((child) => <RenderedNode key={child.id} nodeId={child.id} />) },
    argTypes: {
      children: {
        typeDef: { type: 'element' },
        control: { type: 'slots' },
      },
    },
  });

  return (
    <BindingsContextProvider value={liveBindings}>
      <SetControlledStateContextProvider value={setControlledState}>
        <PageStateContextProvider value={pageState}>{renderedPageContent}</PageStateContextProvider>
      </SetControlledStateContextProvider>
    </BindingsContextProvider>
  );
}

function getPageNavButtonProps(appId: string, page: appDom.PageNode) {
  return { component: Link, to: `/pages/${page.id}` } as ButtonProps;
}

export interface ToolpadAppProps {
  basename: string;
  appId: string;
  version: VersionOrPreview;
  dom: appDom.AppDom;
  components: InstantiatedComponents;
}

export default function ToolpadApp({ basename, appId, version, dom, components }: ToolpadAppProps) {
  const root = appDom.getApp(dom);
  const { pages = [], themes = [] } = appDom.getChildNodes(dom, root);

  const theme = themes.length > 0 ? themes[0] : null;

  const appContext = React.useMemo(() => ({ appId, version }), [appId, version]);

  const queryClient = React.useMemo(() => new QueryClient(), []);

  return (
    <ComponentsContextProvider value={components}>
      <AppContextProvider value={appContext}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <AppThemeProvider node={theme}>
            <DomContextProvider value={dom}>
              <BrowserRouter basename={basename}>
                <Routes>
                  <Route path="/" element={<Navigate replace to="/pages" />} />
                  <Route
                    path="/pages"
                    element={
                      <AppOverview
                        appId={appId}
                        dom={dom}
                        openPageButtonProps={getPageNavButtonProps}
                      />
                    }
                  />
                  {pages.map((page) => (
                    <Route
                      key={page.id}
                      path={`/pages/${page.id}`}
                      element={<RenderedPage nodeId={page.id} />}
                    />
                  ))}
                </Routes>
              </BrowserRouter>
            </DomContextProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </AppContextProvider>
    </ComponentsContextProvider>
  );
}

export const RenderToolpadComponentProvider = RenderToolpadComponentContext.Provider;
