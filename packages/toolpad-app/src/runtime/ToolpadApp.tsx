import * as React from 'react';
import {
  Stack,
  CssBaseline,
  Alert,
  styled,
  AlertTitle,
  LinearProgress,
  NoSsr,
  Container,
} from '@mui/material';
import {
  INITIAL_DATA_QUERY,
  useDataQuery,
  ToolpadComponent,
  createComponent,
  TOOLPAD_COMPONENT,
  Slots,
  Placeholder,
  BindableAttrValues,
  NodeId,
} from '@mui/toolpad-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  Location as RouterLocation,
} from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import {
  fireEvent,
  NodeRuntimeWrapper,
  ResetNodeErrorsKeyProvider,
} from '@mui/toolpad-core/runtime';
import * as appDom from '../appDom';
import { VersionOrPreview } from '../types';
import { createProvidedContext } from '../utils/react';
import AppOverview from '../components/AppOverview';
import { getElementNodeComponentId, PAGE_ROW_COMPONENT_ID } from '../toolpadComponents';
import AppThemeProvider from './AppThemeProvider';
import evalJsBindings, {
  BindingEvaluationResult,
  buildGlobalScope,
  ParsedBinding,
} from './evalJsBindings';
import { HTML_ID_APP_ROOT } from '../constants';
import { mapProperties, mapValues } from '../utils/collections';
import usePageTitle from '../utils/usePageTitle';
import ComponentsContext, { useComponents, useComponent } from './ComponentsContext';
import { AppModulesProvider, useAppModules } from './AppModulesProvider';

const AppRoot = styled('div')({
  overflow: 'auto' /* prevents margins from collapsing into root */,
  minHeight: '100vh',
});

interface AppContext {
  appId: string;
  version: VersionOrPreview;
}

type ToolpadComponents = Partial<Record<string, ToolpadComponent<any>>>;

const [useDomContext, DomContextProvider] = createProvidedContext<appDom.AppDom>('Dom');
const [useAppContext, AppContextProvider] = createProvidedContext<AppContext>('App');
const [useBindingsContext, BindingsContextProvider] =
  createProvidedContext<Record<string, BindingEvaluationResult>>('LiveBindings');
const [useSetControlledBindingContext, SetControlledBindingContextProvider] =
  createProvidedContext<(id: string, result: BindingEvaluationResult) => void>(
    'SetControlledBinding',
  );

function getComponentId(elm: appDom.ElementNode): string {
  const componentId = getElementNodeComponentId(elm);
  return componentId;
}

function useElmToolpadComponent(elm: appDom.ElementNode): ToolpadComponent {
  const componentId = getElementNodeComponentId(elm);
  return useComponent(componentId);
}

interface RenderedNodeProps {
  nodeId: NodeId;
}

function RenderedNode({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const node = appDom.getNode(dom, nodeId, 'element');
  const Component: ToolpadComponent<any> = useElmToolpadComponent(node);
  const { children: childNodes = [] } = appDom.getChildNodes(dom, node);

  return (
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    <RenderedNodeContent nodeId={node.id} childNodes={childNodes} Component={Component} />
  );
}

interface RenderedNodeContentProps {
  nodeId: NodeId;
  childNodes: appDom.ElementNode[];
  Component: ToolpadComponent<any>;
}

function RenderedNodeContent({ nodeId, childNodes, Component }: RenderedNodeContentProps) {
  const setControlledBinding = useSetControlledBindingContext();

  const { argTypes, errorProp, loadingProp, loadingPropSource } = Component[TOOLPAD_COMPONENT];

  const liveBindings = useBindingsContext();
  const boundProps = React.useMemo(() => {
    const loadingPropSourceSet = new Set(loadingPropSource);
    const hookResult: Record<string, any> = {};

    // error state we will propagate to the component
    let error: Error | undefined;
    // loading state we will propagate to the component
    let loading: boolean = false;

    for (const [propName, argType] of Object.entries(argTypes)) {
      const bindingId = `${nodeId}.props.${propName}`;
      const binding = liveBindings[bindingId];
      if (binding) {
        hookResult[propName] = binding.value;
        error = error || binding.error;

        if (binding.loading && loadingPropSourceSet.has(propName)) {
          loading = true;
        }
      }

      if (typeof hookResult[propName] === 'undefined' && argType) {
        hookResult[propName] = argType.defaultValue;
      }
    }

    if (error) {
      if (errorProp) {
        hookResult[errorProp] = error;
      } else {
        console.error(error);
      }
    }

    if (loadingProp && loading) {
      hookResult[loadingProp] = true;
    }

    return hookResult;
  }, [argTypes, errorProp, liveBindings, loadingProp, loadingPropSource, nodeId]);

  const onChangeHandlers: Record<string, (param: any) => void> = React.useMemo(
    () =>
      mapProperties(argTypes, ([key, argType]) => {
        if (!argType || !argType.onChangeProp) {
          return null;
        }

        const handler = (param: any) => {
          const bindingId = `${nodeId}.props.${key}`;
          const value = argType.onChangeHandler ? argType.onChangeHandler(param) : param;
          setControlledBinding(bindingId, { value });
        };
        return [argType.onChangeProp, handler];
      }),
    [argTypes, nodeId, setControlledBinding],
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

  return (
    <NodeRuntimeWrapper nodeId={nodeId} componentConfig={Component[TOOLPAD_COMPONENT]}>
      <Component {...props} />
    </NodeRuntimeWrapper>
  );
}

interface PageRootProps {
  children?: React.ReactNode;
}

function PageRoot({ children }: PageRootProps) {
  return (
    <Container>
      <Stack data-testid="page-root" direction="column" alignItems="stretch" sx={{ my: 2, gap: 1 }}>
        {children}
      </Stack>
    </Container>
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

function resolveBindables(
  bindings: Partial<Record<string, BindingEvaluationResult>>,
  bindingId: string,
  params?: BindableAttrValues<any>,
): Record<string, unknown> {
  return params
    ? mapProperties(params, ([propName]) => [propName, bindings[`${bindingId}.${propName}`]?.value])
    : {};
}

interface QueryNodeProps {
  node: appDom.QueryNode;
}

function QueryNode({ node }: QueryNodeProps) {
  const { appId, version } = useAppContext();
  const bindings = useBindingsContext();
  const setControlledBinding = useSetControlledBindingContext();

  const dataUrl = `/api/data/${appId}/${version}/`;
  const queryId = node.id;
  const params = resolveBindables(bindings, `${node.id}.params`, node.params);

  const queryResult = useDataQuery(dataUrl, queryId, params, {
    refetchOnWindowFocus: node.attributes.refetchOnWindowFocus?.value,
    refetchOnReconnect: node.attributes.refetchOnReconnect?.value,
    refetchInterval: node.attributes.refetchInterval?.value,
  });

  React.useEffect(() => {
    const { isLoading, error, data, rows, ...result } = queryResult;

    for (const [key, value] of Object.entries(result)) {
      const bindingId = `${node.id}.${key}`;
      setControlledBinding(bindingId, { value });
    }

    // Here we propagate the error and loading state to the data and rows prop prop
    // TODO: is there a straightforward way for us to generalize this behavior?
    setControlledBinding(`${node.id}.isLoading`, { value: isLoading });
    const deferredStatus = { loading: isLoading, error };
    setControlledBinding(`${node.id}.error`, { ...deferredStatus, value: error });
    setControlledBinding(`${node.id}.data`, { ...deferredStatus, value: data });
    setControlledBinding(`${node.id}.rows`, { ...deferredStatus, value: rows });
  }, [node.id, queryResult, setControlledBinding]);

  return null;
}

function parseBindings(
  dom: appDom.AppDom,
  page: appDom.PageNode,
  components: ToolpadComponents,
  location: RouterLocation,
) {
  const elements = appDom.getDescendants(dom, page);

  const parsedBindingsMap = new Map<string, ParsedBinding>();
  const controlled = new Set<string>();

  for (const elm of elements) {
    if (appDom.isElement(elm)) {
      const componentId = getComponentId(elm);
      const Component = components[componentId];

      const { argTypes = {} } = Component?.[TOOLPAD_COMPONENT] ?? {};

      for (const [propName, argType] of Object.entries(argTypes)) {
        const bindingId = `${elm.id}.props.${propName}`;
        const scopePath =
          componentId === PAGE_ROW_COMPONENT_ID ? undefined : `${elm.name}.${propName}`;
        if (argType) {
          parsedBindingsMap.set(bindingId, {
            scopePath,
            result: { value: argType.defaultValue },
          });
        }
      }

      for (const [propName, argType] of Object.entries(argTypes)) {
        const binding = elm.props?.[propName];
        const bindingId = `${elm.id}.props.${propName}`;
        const scopePath =
          componentId === PAGE_ROW_COMPONENT_ID ? undefined : `${elm.name}.${propName}`;
        if (argType) {
          if (argType.onChangeProp) {
            const defaultValue: unknown =
              binding?.type === 'const' ? binding?.value : argType.defaultValue;
            controlled.add(bindingId);
            parsedBindingsMap.set(bindingId, {
              scopePath,
              result: { value: defaultValue },
            });
          } else if (binding?.type === 'const') {
            parsedBindingsMap.set(bindingId, {
              scopePath,
              result: { value: binding?.value },
            });
          } else if (binding?.type === 'jsExpression') {
            parsedBindingsMap.set(bindingId, {
              scopePath,
              expression: binding?.value,
            });
          }
        }
      }
    }

    if (appDom.isQuery(elm)) {
      if (elm.params) {
        for (const [paramName, bindable] of Object.entries(elm.params)) {
          const bindingId = `${elm.id}.params.${paramName}`;
          const scopePath = `${elm.name}.params.${paramName}`;
          if (bindable?.type === 'const') {
            parsedBindingsMap.set(bindingId, {
              scopePath,
              result: { value: bindable.value },
            });
          } else if (bindable?.type === 'jsExpression') {
            parsedBindingsMap.set(bindingId, {
              scopePath,
              expression: bindable.value,
            });
          }
        }
      }

      for (const [key, value] of Object.entries(INITIAL_DATA_QUERY)) {
        const bindingId = `${elm.id}.${key}`;
        const scopePath = `${elm.name}.${key}`;
        controlled.add(bindingId);
        parsedBindingsMap.set(bindingId, {
          scopePath,
          result: { value, loading: true },
        });
      }
    }
  }

  const urlParams = new URLSearchParams(location.search);
  const pageParameters = page.attributes.parameters?.value || [];
  for (const [paramName, paramDefault] of pageParameters) {
    const bindingId = `${page.id}.parameters.${paramName}`;
    const scopePath = `page.parameters.${paramName}`;
    parsedBindingsMap.set(bindingId, {
      scopePath,
      result: { value: urlParams.get(paramName) || paramDefault },
    });
  }

  const parsedBindings: Record<string, ParsedBinding> = Object.fromEntries(parsedBindingsMap);

  return { parsedBindings, controlled };
}

const EMPTY_OBJECT = {};

function RenderedPage({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [], queries = [] } = appDom.getChildNodes(dom, page);

  usePageTitle(page.attributes.title.value);

  const location = useLocation();
  const components = useComponents();

  const { parsedBindings, controlled } = React.useMemo(
    () => parseBindings(dom, page, components, location),
    [components, dom, location, page],
  );

  const [pageBindings, setPageBindings] =
    React.useState<Record<string, ParsedBinding>>(parsedBindings);

  React.useEffect(() => {
    setPageBindings((existingBindings) => {
      // Make sure to patch page bindings after dom nodes have been added or removed
      const updated: Record<string, ParsedBinding> = {};
      for (const [key, binding] of Object.entries(parsedBindings)) {
        updated[key] = controlled.has(key) ? existingBindings[key] || binding : binding;
      }
      return updated;
    });
  }, [parsedBindings, controlled]);

  const setControlledBinding = React.useCallback(
    (id: string, result: BindingEvaluationResult) => {
      const parsedBinding = parsedBindings[id];
      setPageBindings((existing) => {
        if (!controlled.has(id)) {
          throw new Error(`Not a controlled binding "${id}"`);
        }
        return {
          ...existing,
          [id]: { ...parsedBinding, result },
        };
      });
    },
    [parsedBindings, controlled],
  );

  const modules = useAppModules();
  const moduleEntry = modules[`pages/${nodeId}`];
  const globalScope = (moduleEntry?.module as any)?.globalScope || EMPTY_OBJECT;

  const evaluatedBindings = React.useMemo(
    () => evalJsBindings(pageBindings, globalScope),
    [globalScope, pageBindings],
  );

  const pageState = React.useMemo(
    () => buildGlobalScope(globalScope, evaluatedBindings),
    [evaluatedBindings, globalScope],
  );
  const liveBindings: Record<string, BindingEvaluationResult> = React.useMemo(
    () => mapValues(evaluatedBindings, (binding) => binding.result || { value: undefined }),
    [evaluatedBindings],
  );

  React.useEffect(() => {
    fireEvent({ type: 'pageStateUpdated', pageState });
  }, [pageState]);

  React.useEffect(() => {
    fireEvent({ type: 'pageBindingsUpdated', bindings: liveBindings });
  }, [liveBindings]);

  return (
    <BindingsContextProvider value={liveBindings}>
      <SetControlledBindingContextProvider value={setControlledBinding}>
        <RenderedNodeContent nodeId={page.id} childNodes={children} Component={PageRootComponent} />

        {queries.map((node) => (
          <QueryNode key={node.id} node={node} />
        ))}
      </SetControlledBindingContextProvider>
    </BindingsContextProvider>
  );
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
}

export default function ToolpadApp({ basename, appId, version, dom }: ToolpadAppProps) {
  const root = appDom.getApp(dom);
  const { pages = [], themes = [] } = appDom.getChildNodes(dom, root);

  const theme = themes.length > 0 ? themes[0] : null;

  const appContext = React.useMemo(() => ({ appId, version }), [appId, version]);

  const queryClient = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
    [],
  );

  const [resetNodeErrorsKey, setResetNodeErrorsKey] = React.useState(0);

  React.useEffect(() => setResetNodeErrorsKey((key) => key + 1), [dom]);

  return (
    <AppRoot id={HTML_ID_APP_ROOT}>
      <NoSsr>
        <DomContextProvider value={dom}>
          <AppThemeProvider node={theme}>
            <CssBaseline />
            <ErrorBoundary FallbackComponent={AppError}>
              <ResetNodeErrorsKeyProvider value={resetNodeErrorsKey}>
                <React.Suspense fallback={<AppLoading />}>
                  <AppModulesProvider dom={dom}>
                    <ComponentsContext dom={dom}>
                      <AppContextProvider value={appContext}>
                        <QueryClientProvider client={queryClient}>
                          <BrowserRouter basename={basename}>
                            <Routes>
                              <Route path="/" element={<Navigate replace to="/pages" />} />
                              <Route path="/pages" element={<AppOverview dom={dom} />} />
                              {pages.map((page) => (
                                <Route
                                  key={page.id}
                                  path={`/pages/${page.id}`}
                                  element={<RenderedPage nodeId={page.id} />}
                                />
                              ))}
                            </Routes>
                          </BrowserRouter>
                        </QueryClientProvider>
                      </AppContextProvider>
                    </ComponentsContext>
                  </AppModulesProvider>
                </React.Suspense>
              </ResetNodeErrorsKeyProvider>
            </ErrorBoundary>
          </AppThemeProvider>
        </DomContextProvider>
      </NoSsr>
    </AppRoot>
  );
}
