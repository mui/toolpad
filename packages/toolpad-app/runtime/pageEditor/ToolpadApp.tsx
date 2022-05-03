import * as React from 'react';
import {
  ButtonProps,
  Stack,
  CssBaseline,
  CircularProgress,
  Alert,
  styled,
  AlertTitle,
} from '@mui/material';
import { merge, omit, pick, without } from 'lodash-es';
import {
  ArgTypeDefinitions,
  INITIAL_DATA_QUERY,
  LiveBindings,
  useDataQuery,
  UseDataQuery,
  ToolpadComponent,
  createComponent,
  TOOLPAD_COMPONENT,
  BindableAttrValue,
} from '@mui/toolpad-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import * as appDom from '../../src/appDom';
import { NodeId, VersionOrPreview } from '../../src/types';
import { createProvidedContext } from '../../src/utils/react';
import AppOverview from '../../src/components/AppOverview';
import { InstantiatedComponent, InstantiatedComponents } from '../../src/toolpadComponents';
import AppThemeProvider from './AppThemeProvider';
import { fireEvent, JsRuntimeProvider } from '../coreRuntime';
import evalExpressions, { BindingEvaluationResult } from './evalExpressions';

export interface RenderToolpadComponentParams {
  Component: ToolpadComponent<any>;
  props: any;
  node: appDom.AppDomNode;
  argTypes: ArgTypeDefinitions;
}

function defaultRenderToolpadComponent({ Component, props }: RenderToolpadComponentParams) {
  return <Component {...props} />;
}
type NodeState = Record<string, unknown>;
type ControlledState = Record<string, NodeState | undefined>;
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
  const { Component } = useElmToolpadComponent(node);
  const { argTypes } = Component[TOOLPAD_COMPONENT];

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
          const { Component } = getElmComponent(components, elm);
          const { argTypes } = Component[TOOLPAD_COMPONENT];
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
        if (appDom.isQueryState(elm)) {
          return [[elm.name, INITIAL_DATA_QUERY]];
        }
        return [];
      }),
    );
  }, [dom, page, components]);
}

function useConstState(dom: appDom.AppDom, page: appDom.PageNode): ControlledState {
  const components = useComponentsContext();
  return React.useMemo(() => {
    const elements = appDom.getDescendants(dom, page);
    return Object.fromEntries(
      elements.flatMap((elm) => {
        if (appDom.isElement(elm)) {
          const { Component } = getElmComponent(components, elm);
          const { argTypes } = Component[TOOLPAD_COMPONENT];
          return [
            [
              elm.name,
              Object.fromEntries(
                Object.entries(argTypes).flatMap(([key, argType]) => {
                  if (!argType || argType.onChangeProp) {
                    return [];
                  }

                  if (elm.props?.[key]?.type === 'const') {
                    return [[key, elm.props?.[key]?.value]];
                  }

                  return [];
                }),
              ),
            ],
          ];
        }
        if (appDom.isQueryState(elm)) {
          return [[elm.name, INITIAL_DATA_QUERY]];
        }
        return [];
      }),
    );
  }, [dom, page, components]);
}

function useConstBindings(
  dom: appDom.AppDom,
  page: appDom.PageNode,
): Record<string, BindingEvaluationResult> {
  const components = useComponentsContext();
  return React.useMemo(() => {
    const bindings: Record<string, BindingEvaluationResult> = {};
    const elements = appDom.getDescendants(dom, page);

    for (const elm of elements) {
      if (appDom.isElement(elm)) {
        const { Component } = getElmComponent(components, elm);
        const { argTypes } = Component[TOOLPAD_COMPONENT];
        for (const [key, argType] of Object.entries(argTypes)) {
          if (argType && !argType.onChangeProp && elm.props?.[key]?.type === 'const') {
            bindings[`${elm.id}.props.${key}`] = { value: elm.props?.[key]?.value };
          }
        }
      }
      if (appDom.isQueryState(elm)) {
        if (elm.params) {
          for (const [key, bindable] of Object.entries(elm.params)) {
            if (bindable?.type === 'const') {
              bindings[`${elm.id}.params.${key}`] = { value: bindable.value };
            }
          }
        }
      }
    }

    return bindings;
  }, [dom, page, components]);
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

const PageRootComponent = createComponent(PageRoot, {
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
});

interface QueryStateNodeProps {
  node: appDom.QueryStateNode;
}

function QueryStateNode({ node }: QueryStateNodeProps) {
  const { appId, version } = useAppContext();
  const bindings = useBindingsContext();
  const setControlledState = useSetControlledStateContext();

  const dataUrl = `/api/data/${appId}/${version}/`;
  const queryId = node.attributes.api.value;
  const params = node.params
    ? Object.fromEntries(
        Object.keys(node.params).map((propName) => [
          propName,
          bindings[`${node.id}.params.${propName}`]?.value,
        ]),
      )
    : {};

  const onResult = React.useCallback(
    (result) => {
      setControlledState((state) => ({ ...state, [node.name]: result }));
    },
    [node.name, setControlledState],
  );

  useDataQuery(onResult, dataUrl, queryId, params, {
    refetchOnWindowFocus: node.attributes.refetchOnWindowFocus?.value,
    refetchOnReconnect: node.attributes.refetchOnReconnect?.value,
    refetchInterval: node.attributes.refetchInterval?.value,
  });

  return null;
}

function getExpression(bindable?: BindableAttrValue<any>): string | undefined {
  if (!bindable) {
    return undefined;
  }
  switch (bindable.type) {
    case 'jsExpression':
      return bindable.value;
    default:
      return undefined;
  }
}

function useLiveBindings(
  dom: appDom.AppDom,
  page: appDom.PageNode,
  currentPageState: PageState,
): Record<string, BindingEvaluationResult> {
  return React.useMemo(() => {
    const descendants = appDom.getDescendants(dom, page);
    const jsExpressions: Record<string, string> = {};
    const bindings = new Map<string, string>();

    descendants.forEach((descendant) => {
      if (appDom.isElement(descendant)) {
        if (descendant.props) {
          for (const [propName, bindable] of Object.entries(descendant.props)) {
            const bindingLabel = `${descendant.name}.${propName}`;
            const expression = getExpression(bindable);
            if (expression) {
              bindings.set(`${descendant.id}.props.${propName}`, bindingLabel);
              jsExpressions[bindingLabel] = expression;
            }
          }
        }
      } else if (appDom.isQueryState(descendant)) {
        if (descendant.params) {
          for (const [propName, bindable] of Object.entries(descendant.params)) {
            const bindingLabel = `${descendant.name}.${propName}`;
            const expression = getExpression(bindable);
            if (expression) {
              bindings.set(`${descendant.id}.params.${propName}`, bindingLabel);
              jsExpressions[bindingLabel] = expression;
            }
          }
        }
      }
    });

    const evaluations = evalExpressions(
      Array.from(bindings.values()),
      currentPageState,
      jsExpressions,
    );

    return Object.fromEntries(
      Array.from(bindings.keys(), (binding, i) => [binding, evaluations[i]]),
    );
  }, [dom, page, currentPageState]);
}

function RenderedPage({ nodeId }: RenderedNodeProps) {
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

  const constState = useConstState(dom, page);

  // Make sure to patch page state after dom nodes have been added or removed
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

  const pageState: PageState = React.useMemo(() => {
    return merge(
      {
        page: urlQueryState,
      },
      controlledState,
      constState,
    );
  }, [urlQueryState, controlledState, constState]);

  React.useEffect(() => {
    fireEvent({ type: 'pageStateUpdated', pageState });
  }, [pageState]);

  const constBindings = useConstBindings(dom, page);
  const jsExpressionBindings = useLiveBindings(dom, page, pageState);

  const liveBindings = React.useMemo(
    () => ({ ...constBindings, ...jsExpressionBindings }),
    [constBindings, jsExpressionBindings],
  );

  console.log(liveBindings);

  React.useEffect(() => {
    fireEvent({ type: 'pageBindingsUpdated', bindings: liveBindings });
  }, [liveBindings]);

  const renderedPageContent = renderToolpadComponent({
    node: page,
    Component: PageRootComponent,
    props: { children: children.map((child) => <RenderedNode key={child.id} nodeId={child.id} />) },
    ...PageRootComponent[TOOLPAD_COMPONENT],
  });

  return (
    <BindingsContextProvider value={liveBindings}>
      <SetControlledStateContextProvider value={setControlledState}>
        <PageStateContextProvider value={pageState}>
          {renderedPageContent}

          {queryStates.map((node) => (
            <QueryStateNode key={node.id} node={node} />
          ))}
        </PageStateContextProvider>
      </SetControlledStateContextProvider>
    </BindingsContextProvider>
  );
}

function getPageNavButtonProps(appId: string, page: appDom.PageNode) {
  return { component: Link, to: `/pages/${page.id}` } as ButtonProps;
}

const FullPageCentered = styled('div')({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

function AppLoading() {
  return (
    <FullPageCentered>
      <CircularProgress />
    </FullPageCentered>
  );
}

function AppError({ error }: FallbackProps) {
  return (
    <FullPageCentered>
      <Alert severity="error">
        <AlertTitle>Something went wrong</AlertTitle>
        <pre>{error.stack}</pre>
      </Alert>
    </FullPageCentered>
  );
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
    <ErrorBoundary FallbackComponent={AppError}>
      <React.Suspense fallback={<AppLoading />}>
        <JsRuntimeProvider>
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
        </JsRuntimeProvider>
      </React.Suspense>
    </ErrorBoundary>
  );
}

export const RenderToolpadComponentProvider = RenderToolpadComponentContext.Provider;
