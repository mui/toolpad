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
import { omit, pick, without } from 'lodash-es';
import {
  ArgTypeDefinitions,
  INITIAL_DATA_QUERY,
  LiveBindings,
  useDataQuery,
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
import {
  InstantiatedComponent,
  InstantiatedComponents,
  ToolpadComponentDefinitions,
} from '../../src/toolpadComponents';
import AppThemeProvider from './AppThemeProvider';
import { fireEvent, JsRuntimeProvider } from '../coreRuntime';
import evalJsBindings, { BindingEvaluationResult } from './evalJsBindings';
import instantiateComponents from './instantiateComponents';

export interface RenderToolpadComponentParams {
  Component: ToolpadComponent<any>;
  props: any;
  node: appDom.AppDomNode;
  argTypes: ArgTypeDefinitions;
}

function defaultRenderToolpadComponent({ Component, props }: RenderToolpadComponentParams) {
  return <Component {...props} />;
}

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
const [useSetControlledBindingsContext, SetControlledBindingsContextProvider] =
  createProvidedContext<
    React.Dispatch<React.SetStateAction<Record<string, BindingEvaluationResult>>>
  >('SetControlledBindings');

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
  const setControlledBindings = useSetControlledBindingsContext();
  const renderToolpadComponent = React.useContext(RenderToolpadComponentContext);

  const node = appDom.getNode(dom, nodeId, 'element');
  const { children = [] } = appDom.getChildNodes(dom, node);
  const { Component } = useElmToolpadComponent(node);
  const { argTypes } = Component[TOOLPAD_COMPONENT];

  const liveBindings = useBindingsContext();
  const boundProps = React.useMemo(
    () =>
      Object.fromEntries(
        Object.keys(argTypes).flatMap((propName) => {
          const bindingId = `${node.id}.props.${propName}`;
          const binding = liveBindings[bindingId];
          return binding ? [[propName, binding.value]] : [];
        }),
      ),
    [argTypes, liveBindings, node.id],
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
            setControlledBindings((oldState) => {
              const bindingId = `${node.id}.props.${key}`;
              return { ...oldState, [bindingId]: { value } };
            });
          };
          return [[argType.onChangeProp, handler]];
        }),
      ),
    [argTypes, node.id, setControlledBindings],
  );

  const reactChildren =
    children.length > 0
      ? children.map((child) => <RenderedNode key={child.id} nodeId={child.id} />)
      : // `undefined` to ensure the defaultProps get picked up
        undefined;

  const props = {
    children: reactChildren,
    ...boundProps,
    ...onChangeHandlers,
  };

  return renderToolpadComponent({
    Component,
    props,
    node,
    argTypes,
  });
}

function useInitialControlledBindings(
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
          if (argType?.onChangeProp) {
            const defaultValue =
              elm.props?.[key]?.type === 'const'
                ? elm.props?.[key]?.value
                : Component.defaultProps?.[key];
            bindings[`${elm.id}.props.${key}`] = { value: defaultValue };
          }
        }
      }
      if (appDom.isQueryState(elm)) {
        for (const [key, value] of Object.entries(INITIAL_DATA_QUERY)) {
          bindings[`${elm.id}.${key}`] = { value };
        }
      }
    }
    return bindings;
  }, [dom, page, components]);
}

function useConstBindings(
  dom: appDom.AppDom,
  page: appDom.PageNode,
): Record<string, BindingEvaluationResult> {
  const location = useLocation();

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

    const urlParams = new URLSearchParams(location.search);
    for (const [key, value] of urlParams.entries()) {
      bindings[`${page.id}.query.${key}`] = { value };
    }

    return bindings;
  }, [dom, page, location.search, components]);
}

function useGlobalScope(
  dom: appDom.AppDom,
  page: appDom.PageNode,
  bindings: Record<string, BindingEvaluationResult>,
): Record<string, unknown> {
  const location = useLocation();
  const components = useComponentsContext();

  return React.useMemo(() => {
    const scope: Record<string, unknown> = {};
    const elements = appDom.getDescendants(dom, page);

    for (const elm of elements) {
      if (appDom.isElement(elm)) {
        const { Component } = getElmComponent(components, elm);
        const { argTypes } = Component[TOOLPAD_COMPONENT];
        const elmScope: Record<string, unknown> = {};
        scope[elm.name] = elmScope;
        for (const propName of Object.keys(argTypes)) {
          const bindingId = `${elm.id}.props.${propName}`;
          const binding = bindings[bindingId];
          if (binding) {
            elmScope[propName] = binding.value;
          }
        }
      }
      if (appDom.isQueryState(elm)) {
        const paramScope: Record<string, unknown> = {};
        const elmScope: Record<string, unknown> = { params: paramScope, ...INITIAL_DATA_QUERY };
        scope[elm.name] = elmScope;
        if (elm.params) {
          for (const paramName of Object.keys(elm.params)) {
            const bindingId = `${elm.id}.params.${paramName}`;
            const binding = bindings[bindingId];
            if (binding) {
              paramScope[paramName] = binding.value;
            }
          }
        }

        for (const propName of Object.keys(INITIAL_DATA_QUERY)) {
          const bindingId = `${elm.id}.${propName}`;
          const binding = bindings[bindingId];
          if (binding) {
            elmScope[propName] = binding.value;
          }
        }
      }
    }

    const urlParams = new URLSearchParams(location.search);
    const pageScope = { query: {} as Record<string, string> };
    scope.page = pageScope;
    for (const key of urlParams.keys()) {
      const bindingId = `${page.id}.query.${key}`;
      const binding = bindings[bindingId];
      if (binding) {
        pageScope.query[key] = binding.value;
      }
    }

    return scope;
  }, [dom, page, bindings, components, location]);
}

interface PageRootProps {
  children?: React.ReactNode;
}

function PageRoot({ children }: PageRootProps) {
  return (
    <Stack data-testid="page-root" direction="column" alignItems="stretch" sx={{ my: 2 }}>
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
  const setControlledBindings = useSetControlledBindingsContext();

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
      setControlledBindings((oldBindings) => {
        const newBindings = { ...oldBindings };
        for (const [key, value] of Object.entries(result)) {
          const bindingId = `${node.id}.${key}`;
          newBindings[bindingId] = { value };
        }
        return newBindings;
      });
    },
    [node.id, setControlledBindings],
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
  currentPageState: Record<string, unknown>,
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

    const evaluations = evalJsBindings(
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
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [], queryStates = [] } = appDom.getChildNodes(dom, page);

  const initialControlledBindings = useInitialControlledBindings(dom, page);
  const [controlledBindings, setControlledBindings] = React.useState(initialControlledBindings);
  // Make sure to patch page state after dom nodes have been added or removed
  React.useEffect(() => {
    setControlledBindings((existing) => {
      const existingKeys = Object.keys(existing);
      const initialKeys = Object.keys(initialControlledBindings);
      const newInitial = without(initialKeys, ...existingKeys);
      const oldExisting = without(existingKeys, ...initialKeys);
      if (newInitial.length > 0 || oldExisting.length > 0) {
        return {
          ...omit(existing, ...oldExisting),
          ...pick(initialControlledBindings, ...newInitial),
        };
      }
      return existing;
    });
  }, [initialControlledBindings]);

  const constBindings = useConstBindings(dom, page);
  const inputBindings = React.useMemo(
    () => ({ ...controlledBindings, ...constBindings }),
    [controlledBindings, constBindings],
  );
  const globalScope = useGlobalScope(dom, page, inputBindings);
  const jsExpressionBindings = useLiveBindings(dom, page, globalScope);

  const liveBindings = React.useMemo(
    () => ({ ...inputBindings, ...jsExpressionBindings }),
    [inputBindings, jsExpressionBindings],
  );

  const pageState = useGlobalScope(dom, page, liveBindings);

  React.useEffect(() => {
    fireEvent({ type: 'pageStateUpdated', pageState });
  }, [pageState]);

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
      <SetControlledBindingsContextProvider value={setControlledBindings}>
        {renderedPageContent}

        {queryStates.map((node) => (
          <QueryStateNode key={node.id} node={node} />
        ))}
      </SetControlledBindingsContextProvider>
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
  components: ToolpadComponentDefinitions;
}

export default function ToolpadApp({ basename, appId, version, dom, components }: ToolpadAppProps) {
  const root = appDom.getApp(dom);
  const { pages = [], themes = [] } = appDom.getChildNodes(dom, root);

  const theme = themes.length > 0 ? themes[0] : null;

  const appContext = React.useMemo(() => ({ appId, version }), [appId, version]);

  const queryClient = React.useMemo(() => new QueryClient(), []);

  const instantiatedComponents = React.useMemo(
    () => instantiateComponents(components),
    [components],
  );

  return (
    <ErrorBoundary FallbackComponent={AppError}>
      <React.Suspense fallback={<AppLoading />}>
        <JsRuntimeProvider>
          <ComponentsContextProvider value={instantiatedComponents}>
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
