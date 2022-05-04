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
} from '@mui/toolpad-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  Location as RouterLocation,
} from 'react-router-dom';
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
    ...boundProps,
    ...onChangeHandlers,
    children: reactChildren,
  };

  return renderToolpadComponent({
    Component,
    props,
    node,
    argTypes,
  });
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

function parseBindings(
  dom: appDom.AppDom,
  page: appDom.PageNode,
  components: InstantiatedComponents,
  location: RouterLocation,
) {
  const defaultValues: Record<string, BindingEvaluationResult> = {};
  const constValues: Record<string, BindingEvaluationResult> = {};
  const initialControlledValues: Record<string, BindingEvaluationResult> = {};
  const jsExpressions: Record<string, string> = {};
  const expressionBindings: Record<string, string> = {};

  const elements = appDom.getDescendants(dom, page);

  for (const elm of elements) {
    if (appDom.isElement(elm)) {
      const { Component } = getElmComponent(components, elm);
      const { argTypes } = Component[TOOLPAD_COMPONENT];

      for (const [propName, argType] of Object.entries(argTypes)) {
        const binding = elm.props?.[propName];
        const bindingId = `${elm.id}.props.${propName}`;
        if (argType) {
          if (argType.onChangeProp) {
            const defaultValue =
              binding?.type === 'const' ? binding?.value : Component.defaultProps?.[propName];
            initialControlledValues[bindingId] = { value: defaultValue };
          } else if (binding?.type === 'const') {
            constValues[bindingId] = { value: binding?.value };
          } else if (binding?.type === 'jsExpression') {
            const variableExpression = `${elm.name}.${propName}`;
            expressionBindings[bindingId] = variableExpression;
            jsExpressions[variableExpression] = binding?.value;
          }
        }
      }

      for (const [propName, argType] of Object.entries(argTypes)) {
        const bindingId = `${elm.id}.props.${propName}`;
        if (argType) {
          defaultValues[bindingId] = { value: Component.defaultProps?.[propName] };
        }
      }
    }

    if (appDom.isQueryState(elm)) {
      if (elm.params) {
        for (const [paramName, bindable] of Object.entries(elm.params)) {
          const bindingId = `${elm.id}.params.${paramName}`;
          if (bindable?.type === 'const') {
            constValues[bindingId] = { value: bindable.value };
          } else if (bindable?.type === 'jsExpression') {
            const variableExpression = `${elm.name}.${paramName}`;
            expressionBindings[bindingId] = variableExpression;
            jsExpressions[variableExpression] = bindable.value;
          }
        }
      }

      for (const [key, value] of Object.entries(INITIAL_DATA_QUERY)) {
        initialControlledValues[`${elm.id}.${key}`] = { value };
      }
    }
  }

  const urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams.entries()) {
    constValues[`${page.id}.query.${key}`] = { value };
  }

  return {
    defaultValues,
    constValues,
    initialControlledValues,
    jsExpressions,
    expressionBindings,
  };
}

function RenderedPage({ nodeId }: RenderedNodeProps) {
  const renderToolpadComponent = React.useContext(RenderToolpadComponentContext);
  const dom = useDomContext();
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [], queryStates = [] } = appDom.getChildNodes(dom, page);

  const location = useLocation();
  const components = useComponentsContext();

  const { defaultValues, constValues, initialControlledValues, jsExpressions, expressionBindings } =
    React.useMemo(
      () => parseBindings(dom, page, components, location),
      [components, dom, location, page],
    );

  const [controlledBindings, setControlledBindings] = React.useState(initialControlledValues);
  // Make sure to patch page state after dom nodes have been added or removed
  React.useEffect(() => {
    setControlledBindings((existing) => {
      const existingKeys = Object.keys(existing);
      const initialKeys = Object.keys(initialControlledValues);
      const newInitial = without(initialKeys, ...existingKeys);
      const oldExisting = without(existingKeys, ...initialKeys);
      if (newInitial.length > 0 || oldExisting.length > 0) {
        return {
          ...omit(existing, ...oldExisting),
          ...pick(initialControlledValues, ...newInitial),
        };
      }
      return existing;
    });
  }, [initialControlledValues]);

  const inputBindings = React.useMemo(
    () => ({ ...defaultValues, ...constValues, ...controlledBindings }),
    [defaultValues, constValues, controlledBindings],
  );
  const globalScope = useGlobalScope(dom, page, inputBindings);
  const jsExpressionValues = React.useMemo(() => {
    const evaluations = evalJsBindings(globalScope, jsExpressions);

    return Object.fromEntries(
      Object.keys(expressionBindings).map((binding, i) => [binding, evaluations[i]]),
    );
  }, [expressionBindings, globalScope, jsExpressions]);

  const liveBindings = React.useMemo(
    () => ({ ...inputBindings, ...jsExpressionValues }),
    [inputBindings, jsExpressionValues],
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
