import * as React from 'react';
import {
  ButtonProps,
  Stack,
  CssBaseline,
  Alert,
  styled,
  AlertTitle,
  LinearProgress,
  NoSsr,
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
import ReactIs from 'react-is';
import {
  fireEvent,
  JsRuntimeProvider,
  NodeRuntimeWrapper,
  ResetNodeErrorsKeyProvider,
} from '@mui/toolpad-core/runtime';
import * as builtins from '@mui/toolpad-components';
import * as appDom from '../appDom';
import { NodeId, VersionOrPreview } from '../types';
import { createProvidedContext } from '../utils/react';
import AppOverview from '../components/AppOverview';
import {
  getElementNodeComponentId,
  getToolpadComponents,
  PAGE_ROW_COMPONENT_ID,
} from '../toolpadComponents';
import AppThemeProvider from './AppThemeProvider';
import evalJsBindings, {
  BindingEvaluationResult,
  buildGlobalScope,
  ParsedBinding,
} from './evalJsBindings';
import createCodeComponent from './createCodeComponent';
import { HTML_ID_APP_ROOT } from '../constants';
import usePageTitle from '../utils/usePageTitle';
import DomProvider, { useDomContext } from './DomProvider';

const AppRoot = styled('div')({
  overflow: 'auto' /* prevents margins from collapsing into root */,
  minHeight: '100vh',
});

interface AppContext {
  appId: string;
  version: VersionOrPreview;
}

const [useComponentsContext, ComponentsContextProvider] =
  createProvidedContext<(id: string) => ToolpadComponent>('Components');
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
  const getComponent = useComponentsContext();
  const componentId = getElementNodeComponentId(elm);
  return getComponent(componentId);
}

interface RenderedNodeProps {
  nodeId: NodeId;
}

function RenderedNode({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const node = appDom.getNode(dom, nodeId, 'element');
  const Component = useElmToolpadComponent(node);
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
      } else if (argType) {
        hookResult[propName] = argType.defaultValue;
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

          const handler = (param: any) => {
            const bindingId = `${nodeId}.props.${key}`;
            const value = argType.onChangeHandler ? argType.onChangeHandler(param) : param;
            setControlledBinding(bindingId, { value });
          };
          return [[argType.onChangeProp, handler]];
        }),
      ),
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

  return <Component {...props} />;
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

function resolveBindables(
  bindings: Partial<Record<string, BindingEvaluationResult>>,
  bindingId: string,
  params?: BindableAttrValues<any>,
) {
  return params
    ? Object.fromEntries(
        Object.keys(params).map((propName) => [
          propName,
          bindings[`${bindingId}.${propName}`]?.value,
        ]),
      )
    : {};
}

interface QueryNodeProps {
  // TODO: deprecate `QueryStateNode`
  node: appDom.QueryNode | appDom.QueryStateNode;
}

function QueryNode({ node }: QueryNodeProps) {
  const { appId, version } = useAppContext();
  const bindings = useBindingsContext();
  const setControlledBinding = useSetControlledBindingContext();

  const dataUrl = `/api/data/${appId}/${version}/`;
  const queryId = appDom.isQueryState(node) ? node.attributes.api.value : node.id;
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
  getComponent: (id: string) => ToolpadComponent<any>,
  location: RouterLocation,
) {
  const elements = appDom.getDescendants(dom, page);

  const parsedBindingsMap = new Map<string, ParsedBinding>();
  const controlled = new Set<string>();

  for (const elm of elements) {
    if (appDom.isElement(elm)) {
      const componentId = getComponentId(elm);
      const Component = getComponent(componentId);

      const { argTypes } = Component[TOOLPAD_COMPONENT];

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

    if (appDom.isQueryState(elm) || appDom.isQuery(elm)) {
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
  for (const [paramName, paramValue] of urlParams.entries()) {
    const bindingId = `${page.id}.query.${paramName}`;
    const scopePath = `page.query.${paramName}`;
    parsedBindingsMap.set(bindingId, {
      scopePath,
      result: { value: paramValue },
    });
  }

  const parsedBindings: Record<string, ParsedBinding> = Object.fromEntries(parsedBindingsMap);

  return { parsedBindings, controlled };
}

function RenderedPage({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const page = appDom.getNode(dom, nodeId, 'page');
  const { children = [], queryStates = [], queries = [] } = appDom.getChildNodes(dom, page);

  usePageTitle(page.attributes.title.value);

  const location = useLocation();
  const getComponent = useComponentsContext();

  const { parsedBindings, controlled } = React.useMemo(
    () => parseBindings(dom, page, getComponent, location),
    [getComponent, dom, location, page],
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

  const evaluatedBindings = React.useMemo(() => evalJsBindings(pageBindings), [pageBindings]);

  const pageState = React.useMemo(() => buildGlobalScope(evaluatedBindings), [evaluatedBindings]);
  const liveBindings = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(evaluatedBindings).map(([bindingId, binding]) => [
          bindingId,
          binding.result || { value: undefined },
        ]),
      ),
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
        <NodeRuntimeWrapper nodeId={page.id} componentConfig={PageRootComponent[TOOLPAD_COMPONENT]}>
          <RenderedNodeContent
            nodeId={page.id}
            childNodes={children}
            Component={PageRootComponent}
          />
        </NodeRuntimeWrapper>

        {queryStates.map((node) => (
          <QueryNode key={node.id} node={node} />
        ))}

        {queries.map((node) => (
          <QueryNode key={node.id} node={node} />
        ))}
      </SetControlledBindingContextProvider>
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

function createToolpadComponentThatThrows(error: Error) {
  return createComponent(() => {
    throw error;
  });
}

function instantiateCodeComponent(src: string): ToolpadComponent {
  let ResolvedComponent: ToolpadComponent;

  const LazyComponent = React.lazy(async () => {
    let ImportedComponent: ToolpadComponent = createComponent(() => null);
    try {
      ImportedComponent = await createCodeComponent(src);
    } catch (error: any) {
      ImportedComponent = createToolpadComponentThatThrows(error);
    }

    ResolvedComponent.defaultProps = ImportedComponent.defaultProps;

    const importedConfig = ImportedComponent[TOOLPAD_COMPONENT];

    // We update the componentConfig after the component is loaded
    if (importedConfig) {
      ResolvedComponent[TOOLPAD_COMPONENT] = importedConfig;
    }

    return { default: ImportedComponent };
  });

  const LazyWrapper = React.forwardRef((props, ref) => (
    // @ts-expect-error Need to update @types/react to > 18
    <LazyComponent ref={ref} {...props} />
  ));

  // We start with a lazy component with default argTypes
  ResolvedComponent = createComponent(LazyWrapper);

  return ResolvedComponent;
}

const CODE_COMPONENTS_CACHE = new Map<string, ToolpadComponent>();

export interface ToolpadAppProps {
  basename: string;
  appId: string;
  version: VersionOrPreview;
  dom: appDom.AppDom;
}

export default function ToolpadApp({ basename, appId, version, dom }: ToolpadAppProps) {
  const root = appDom.getApp(dom);
  const { pages = [], themes = [], codeComponents = [] } = appDom.getChildNodes(dom, root);

  const theme = themes.length > 0 ? themes[0] : null;

  const appContext = React.useMemo(() => ({ appId, version }), [appId, version]);

  const queryClient = React.useMemo(() => new QueryClient(), []);

  const components = React.useMemo(
    () => getToolpadComponents(appId, version, dom),
    [appId, version, dom],
  );

  const getComponent = React.useCallback(
    (id: string): ToolpadComponent => {
      const def = components[id];

      if (def?.builtin) {
        const builtin = (builtins as any)[def.builtin];

        if (!ReactIs.isValidElementType(builtin) || typeof builtin === 'string') {
          throw new Error(`Invalid builtin component imported "${def.builtin}"`);
        }

        if (!(builtin as any)[TOOLPAD_COMPONENT]) {
          throw new Error(`Builtin component "${id}" is missing component config`);
        }

        return builtin as ToolpadComponent;
      }

      if (def?.codeComponentId) {
        const componentId = def.codeComponentId;
        const codeComponentNode = appDom.getNode(dom, componentId, 'codeComponent');
        const src = codeComponentNode.attributes.code.value;

        const CachedComponent = CODE_COMPONENTS_CACHE.get(src);

        if (CachedComponent) {
          return CachedComponent;
        }

        const ResolvedComponent = instantiateCodeComponent(src);

        CODE_COMPONENTS_CACHE.set(src, ResolvedComponent);

        return ResolvedComponent;
      }

      return createToolpadComponentThatThrows(new Error(`Can't find component for "${id}"`));
    },
    [dom, components],
  );

  React.useEffect(() => {
    // Clean up code components cache
    const currentCachedSrcs = new Set<string>(CODE_COMPONENTS_CACHE.keys());
    for (const codeComponent of codeComponents) {
      const src = codeComponent.attributes.code.value;
      currentCachedSrcs.delete(src);
    }

    for (const src of currentCachedSrcs) {
      CODE_COMPONENTS_CACHE.delete(src);
    }
  }, [codeComponents]);

  const [resetNodeErrorsKey, setResetNodeErrorsKey] = React.useState(0);

  React.useEffect(() => setResetNodeErrorsKey((key) => key + 1), [dom]);

  return (
    <NoSsr>
      <DomProvider dom={dom}>
        <AppRoot id={HTML_ID_APP_ROOT}>
          <CssBaseline />
          <ErrorBoundary FallbackComponent={AppError}>
            <ResetNodeErrorsKeyProvider value={resetNodeErrorsKey}>
              <React.Suspense fallback={<AppLoading />}>
                <JsRuntimeProvider>
                  <ComponentsContextProvider value={getComponent}>
                    <AppContextProvider value={appContext}>
                      <QueryClientProvider client={queryClient}>
                        <AppThemeProvider node={theme}>
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
                        </AppThemeProvider>
                      </QueryClientProvider>
                    </AppContextProvider>
                  </ComponentsContextProvider>
                </JsRuntimeProvider>
              </React.Suspense>
            </ResetNodeErrorsKeyProvider>
          </ErrorBoundary>
        </AppRoot>
      </DomProvider>
    </NoSsr>
  );
}
