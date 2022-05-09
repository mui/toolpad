import * as React from 'react';
import {
  ButtonProps,
  Stack,
  CssBaseline,
  Alert,
  styled,
  AlertTitle,
  LinearProgress,
} from '@mui/material';
import { omit, pick, set, without } from 'lodash-es';
import {
  INITIAL_DATA_QUERY,
  useDataQuery,
  ToolpadComponent,
  createComponent,
  TOOLPAD_COMPONENT,
  UseDataQuery,
  Slots,
  Placeholder,
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
import {
  fireEvent,
  JsRuntimeProvider,
  NodeRuntimeWrapper,
  ResetNodeErrorsKeyProvider,
} from '../coreRuntime';
import evalJsBindings, { BindingEvaluationResult } from './evalJsBindings';
import instantiateComponents from './instantiateComponents';

const PAGE_ROW_COMPONENT_ID = 'PageRow';

interface AppContext {
  appId: string;
  version: VersionOrPreview;
}

const [useComponentsContext, ComponentsContextProvider] =
  createProvidedContext<InstantiatedComponents>('Components');
const [useAppContext, AppContextProvider] = createProvidedContext<AppContext>('App');
const [useDomContext, DomContextProvider] = createProvidedContext<appDom.AppDom>('Dom');
const [useBindingsContext, BindingsContextProvider] =
  createProvidedContext<Record<string, BindingEvaluationResult>>('LiveBindings');
const [useSetControlledBindingsContext, SetControlledBindingsContextProvider] =
  createProvidedContext<
    React.Dispatch<React.SetStateAction<Record<string, BindingEvaluationResult>>>
  >('SetControlledBindings');

function getElmComponent(
  components: InstantiatedComponents,
  elm: appDom.ElementNode,
): InstantiatedComponent & { id: string } {
  const componentId = elm.attributes.component.value;
  const component = components[componentId];
  if (!component) {
    throw new Error(`Rendering unknown component "${componentId}"`);
  }
  return { ...component, id: componentId };
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
  const node = appDom.getNode(dom, nodeId, 'element');
  const { Component } = useElmToolpadComponent(node);
  const { children = [] } = appDom.getChildNodes(dom, node);
  return (
    <NodeRuntimeWrapper nodeId={node.id} componentConfig={Component[TOOLPAD_COMPONENT]}>
      {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
      <RenderedNodeContent nodeId={node.id} childNodes={children} Component={Component} />
    </NodeRuntimeWrapper>
  );
}

interface RenderedNodeContentProps {
  nodeId: NodeId;
  childNodes: appDom.ElementNode[];
  Component: ToolpadComponent<any>;
}

function RenderedNodeContent({ nodeId, childNodes, Component }: RenderedNodeContentProps) {
  const setControlledBindings = useSetControlledBindingsContext();

  const { argTypes, errorProp, loadingProp, loadingPropSource } = Component[TOOLPAD_COMPONENT];

  const liveBindings = useBindingsContext();
  const boundProps = React.useMemo(() => {
    const loadingPropSourceSet = new Set(loadingPropSource);
    const hookResult: Record<string, any> = {};

    // error state we will propagate tot he component
    let error: Error | undefined;
    // loading state we will propagate to the component
    let loading: boolean = false;

    for (const propName of Object.keys(argTypes)) {
      const bindingId = `${nodeId}.props.${propName}`;
      const binding = liveBindings[bindingId];
      if (binding) {
        hookResult[propName] = binding.value;
        error = error || binding.error;

        if (loading && loadingPropSourceSet.has(propName)) {
          loading = true;
        }
      }
    }

    if (error) {
      if (errorProp) {
        hookResult[errorProp] = error;
      } else {
        throw error;
      }
    }

    if (loadingProp && loading) {
      hookResult[loadingProp] = true;
    }

    return hookResult;
  }, [argTypes, errorProp, liveBindings, loadingProp, loadingPropSource, nodeId]);

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
              const bindingId = `${nodeId}.props.${key}`;
              return { ...oldState, [bindingId]: { value } };
            });
          };
          return [[argType.onChangeProp, handler]];
        }),
      ),
    [argTypes, nodeId, setControlledBindings],
  );

  const reactChildren =
    childNodes.length > 0
      ? childNodes.map((child) => <RenderedNode key={child.id} nodeId={child.id} />)
      : // `undefined` to ensure the defaultProps get picked up
        undefined;

  const props: Record<string, any> = React.useMemo(() => {
    return {
      ...boundProps,
      ...onChangeHandlers,
      children: reactChildren,
    };
  }, [boundProps, onChangeHandlers, reactChildren]);

  // Wrap with slots
  for (const [propName, argType] of Object.entries(argTypes)) {
    if (argType?.typeDef.type === 'element') {
      if (argType.control?.type === 'slots') {
        const value = props[propName];
        props[propName] = <Slots prop={propName}>{value}</Slots>;
      } else if (argType.control?.type === 'slot') {
        const value = props[propName];
        props[propName] = <Placeholder prop={propName}>{value}</Placeholder>;
      }
    }
  }

  return <Component {...props} />;
}

function useGlobalScope(
  scopePathToBindingId: Record<string, string>,
  inputBindings: Record<string, BindingEvaluationResult>,
  scopePatshToHide: string[],
): Record<string, unknown> {
  return React.useMemo(() => {
    const globalScope = {};
    const scopePatshToHideSet = new Set(scopePatshToHide);
    for (const [scopePath, bindingId] of Object.entries(scopePathToBindingId)) {
      if (!scopePatshToHideSet.has(scopePath)) {
        const value = inputBindings[bindingId]?.value;
        set(globalScope, scopePath, value);
      }
    }
    return globalScope;
  }, [scopePatshToHide, scopePathToBindingId, inputBindings]);
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
    ({ isLoading, error, data, rows, ...result }: UseDataQuery) => {
      setControlledBindings((oldBindings) => {
        const newBindings = { ...oldBindings };

        for (const [key, value] of Object.entries(result)) {
          const bindingId = `${node.id}.${key}`;
          newBindings[bindingId] = { value };
        }

        // Here we propagate the error and loading state to the data and rows prop prop
        // TODO: is there a straightforward way fro us to generalize this behavior?
        newBindings[`${node.id}.isLoading`] = { value: isLoading };
        const deferredStatus = { loading: isLoading, error };
        newBindings[`${node.id}.error`] = { ...deferredStatus, value: error };
        newBindings[`${node.id}.data`] = { ...deferredStatus, value: data };
        newBindings[`${node.id}.rows`] = { ...deferredStatus, value: rows };

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
  const scopePathToBindingId: Record<string, string> = {};
  // We may want to hide some things in the scope, but still have it visible in the databinding
  const scopePatshToHide: string[] = [];

  const elements = appDom.getDescendants(dom, page);

  for (const elm of elements) {
    if (appDom.isElement(elm)) {
      const { id: componentId, Component } = getElmComponent(components, elm);

      const { argTypes } = Component[TOOLPAD_COMPONENT];

      for (const [propName, argType] of Object.entries(argTypes)) {
        const binding = elm.props?.[propName];
        const bindingId = `${elm.id}.props.${propName}`;
        const scopePath = `${elm.name}.${propName}`;
        scopePathToBindingId[scopePath] = bindingId;
        if (componentId === PAGE_ROW_COMPONENT_ID) {
          scopePatshToHide.push(scopePath);
        }
        if (argType) {
          if (argType.onChangeProp) {
            const defaultValue =
              binding?.type === 'const' ? binding?.value : Component.defaultProps?.[propName];
            initialControlledValues[bindingId] = { value: defaultValue };
          } else if (binding?.type === 'const') {
            constValues[bindingId] = { value: binding?.value };
          } else if (binding?.type === 'jsExpression') {
            jsExpressions[bindingId] = binding?.value;
          }
        }
      }

      for (const [propName, argType] of Object.entries(argTypes)) {
        const bindingId = `${elm.id}.props.${propName}`;
        scopePathToBindingId[`${elm.name}.${propName}`] = bindingId;
        if (argType) {
          defaultValues[bindingId] = { value: Component.defaultProps?.[propName] };
        }
      }
    }

    if (appDom.isQueryState(elm)) {
      if (elm.params) {
        for (const [paramName, bindable] of Object.entries(elm.params)) {
          const bindingId = `${elm.id}.params.${paramName}`;
          scopePathToBindingId[`${elm.name}.params.${paramName}`] = bindingId;
          if (bindable?.type === 'const') {
            constValues[bindingId] = { value: bindable.value };
          } else if (bindable?.type === 'jsExpression') {
            jsExpressions[bindingId] = bindable.value;
          }
        }
      }

      for (const [key, value] of Object.entries(INITIAL_DATA_QUERY)) {
        const bindingId = `${elm.id}.${key}`;
        scopePathToBindingId[`${elm.name}.${key}`] = bindingId;
        initialControlledValues[bindingId] = { value, loading: true };
      }
    }
  }

  const urlParams = new URLSearchParams(location.search);
  for (const [paramName, paramValue] of urlParams.entries()) {
    const bindingId = `${page.id}.query.${paramName}`;
    scopePathToBindingId[`page.query.${paramName}`] = bindingId;
    constValues[bindingId] = { value: paramValue };
  }

  return {
    defaultValues,
    constValues,
    initialControlledValues,
    jsExpressions,
    scopePathToBindingId,
    scopePatshToHide,
  };
}

function RenderedPage({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [], queryStates = [] } = appDom.getChildNodes(dom, page);

  const location = useLocation();
  const components = useComponentsContext();

  const {
    defaultValues,
    constValues,
    initialControlledValues,
    jsExpressions,
    scopePathToBindingId,
    scopePatshToHide,
  } = React.useMemo(
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

  const globalScope = useGlobalScope(scopePathToBindingId, inputBindings, scopePatshToHide);

  const jsExpressionValues = React.useMemo(
    () => evalJsBindings(globalScope, inputBindings, jsExpressions, scopePathToBindingId),
    [globalScope, inputBindings, jsExpressions, scopePathToBindingId],
  );

  const liveBindings = React.useMemo(
    () => ({ ...inputBindings, ...jsExpressionValues }),
    [inputBindings, jsExpressionValues],
  );

  const pageState = useGlobalScope(scopePathToBindingId, liveBindings, scopePatshToHide);

  React.useEffect(() => {
    fireEvent({ type: 'pageStateUpdated', pageState });
  }, [pageState]);

  React.useEffect(() => {
    fireEvent({ type: 'pageBindingsUpdated', bindings: liveBindings });
  }, [liveBindings]);

  return (
    <BindingsContextProvider value={liveBindings}>
      <SetControlledBindingsContextProvider value={setControlledBindings}>
        <NodeRuntimeWrapper nodeId={page.id} componentConfig={PageRootComponent[TOOLPAD_COMPONENT]}>
          <RenderedNodeContent
            nodeId={page.id}
            childNodes={children}
            Component={PageRootComponent}
          />
        </NodeRuntimeWrapper>

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
  return <LinearProgress />;
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

  const [resetNodeErrorsKey, setResetNodeErrorsKey] = React.useState(0);

  React.useEffect(() => setResetNodeErrorsKey((key) => key + 1), [dom]);

  return (
    <React.Fragment>
      <CssBaseline />
      <ErrorBoundary FallbackComponent={AppError}>
        <ResetNodeErrorsKeyProvider value={resetNodeErrorsKey}>
          <React.Suspense fallback={<AppLoading />}>
            <JsRuntimeProvider>
              <ComponentsContextProvider value={instantiatedComponents}>
                <AppContextProvider value={appContext}>
                  <QueryClientProvider client={queryClient}>
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
        </ResetNodeErrorsKeyProvider>
      </ErrorBoundary>
    </React.Fragment>
  );
}
