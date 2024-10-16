'use client';

import * as React from 'react';
import {
  Stack,
  CssBaseline,
  Alert,
  Box,
  styled,
  AlertTitle,
  LinearProgress,
  Container,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ToolpadComponent,
  createComponent,
  TOOLPAD_COMPONENT,
  Slots,
  Placeholder,
  NodeId,
  BindableAttrValue,
  NestedBindableAttrs,
  BindingEvaluationResult,
  ScopeMeta,
  getArgTypeDefaultValue,
  ScopeMetaPropField,
  ComponentsContextProvider,
  isToolpadComponent,
  createToolpadComponentThatThrows,
  useComponents,
  useComponent,
  RuntimeScope,
  ApplicationVm,
  JsExpressionAttrValue,
  ComponentConfig,
  CanvasEventsContext,
  NodeErrorProps,
  NodeRuntimeWrapper,
  ResetNodeErrorsKeyProvider,
  UseDataProviderContext,
  AppHost,
  useAppHost,
} from '@toolpad/studio-runtime';
import { useAssertedContext, useNonNullableContext } from '@toolpad/utils/react';
import { mapProperties, mapValues } from '@toolpad/utils/collections';
import { set as setObjectPath } from 'lodash-es';
import { useMutation } from '@tanstack/react-query';
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  Location as RouterLocation,
  useNavigate,
  useMatch,
  useParams,
  Outlet,
  BrowserRouter,
} from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ErrorIcon from '@mui/icons-material/Error';
import { getBrowserRuntime } from '@toolpad/studio-runtime/jsBrowserRuntime';
import * as builtIns from '@toolpad/studio-components';
import { errorFrom } from '@toolpad/utils/errors';
import useBoolean from '@toolpad/utils/hooks/useBoolean';
import usePageTitle from '@toolpad/utils/hooks/usePageTitle';
import invariant from 'invariant';
import useEventCallback from '@mui/utils/useEventCallback';
import * as appDom from '@toolpad/studio-runtime/appDom';
import useSsr from '@toolpad/utils/hooks/useSsr';
import { RuntimeState } from './types';
import { getBindingType, getBindingValue } from './bindings';
import {
  getElementNodeComponentId,
  isPageLayoutComponent,
  isPageRow,
  PAGE_ROW_COMPONENT_ID,
} from './toolpadComponents';
import AppThemeProvider from './AppThemeProvider';
import evalJsBindings, {
  buildGlobalScope,
  EvaluatedBinding,
  ParsedBinding,
} from './evalJsBindings';
import { layoutBoxArgTypes } from './toolpadComponents/layoutBox';
import { useDataQuery, UseFetch } from './useDataQuery';
import { CanvasHooksContext, NavigateToPage } from './CanvasHooksContext';
import PreviewHeader from './PreviewHeader';
import { AppLayout } from './AppLayout';
import { useDataProvider } from './useDataProvider';
import { RuntimeApiContext, createApi } from './api';
import { AuthContext, useAuth, AuthSession } from './useAuth';
import { RequireAuthorization } from './auth';
import SignInPage from './SignInPage';
import { componentsStore } from './globalState';

const browserJsRuntime = getBrowserRuntime();

const Pre = styled('pre')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.fontFamilyMonospaced,
}));

const internalComponents: ToolpadComponents = Object.fromEntries(
  Object.entries(builtIns).map(([name, builtIn]) => {
    if (!isToolpadComponent(builtIn)) {
      builtIn = createToolpadComponentThatThrows(
        new Error(`Imported builtIn "${name}" is not a ToolpadComponent`),
      );
    }
    return [name, builtIn] as [string, ToolpadComponent];
  }),
);

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/production').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: any = {};

const INITIAL_FETCH: UseFetch = {
  call: async () => {},
  refetch: async () => {},
  fetch: async () => {},
  isLoading: false,
  isFetching: false,
  error: null,
  data: null,
  rows: [],
};

function usePageNavigator(): NavigateToPage {
  const navigate = useNavigate();

  const canvasEvents = React.useContext(CanvasEventsContext);

  const navigateToPage: NavigateToPage = React.useCallback(
    (pageName, pageParameters) => {
      const urlParams = pageParameters && new URLSearchParams(pageParameters);

      if (canvasEvents) {
        canvasEvents.emit('pageNavigationRequest', { pageName });
      } else {
        navigate({
          pathname: `/pages/${pageName}`,
          ...(urlParams
            ? {
                search: urlParams.toString(),
              }
            : {}),
        });
      }
    },
    [canvasEvents, navigate],
  );

  return navigateToPage;
}

function isEqual(
  a: BindingEvaluationResult<unknown>,
  b: BindingEvaluationResult<unknown>,
): boolean {
  return a.value === b.value && !!a.error === !!b.error && a.loading === b.loading;
}

const AppRoot = styled('div')({
  overflow: 'auto' /* Prevents margins from collapsing into root */,
  position: 'relative' /* Makes sure that the editor overlay that renders inside sizes correctly */,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});

const EditorOverlay = styled('div')({
  position: 'absolute',
  inset: '0 0 0 0',
  pointerEvents: 'none',
  overflow: 'hidden',
});

type ToolpadComponents = Partial<Record<string, ToolpadComponent<any>>>;

interface CreateScopeParams {
  parentScope?: RuntimeScope;
  localValues?: Record<string, unknown> | undefined;
  meta: ScopeMeta;
}

function createScope(
  id: string,
  bindings: Record<string, ParsedBinding | EvaluatedBinding<unknown>>,
  { localValues, parentScope, meta = {} }: CreateScopeParams,
): RuntimeScope {
  const scopeValues = { ...parentScope?.values, ...localValues };

  const evaluatedBindings = evalJsBindings(browserJsRuntime, bindings, scopeValues);

  return {
    id,
    parentScope,
    bindings: mapValues(evaluatedBindings, (binding) => binding.result || { value: undefined }),
    values: buildGlobalScope(scopeValues, evaluatedBindings),
    meta,
  };
}

type ApplicationVmApi = {
  registerScope: (scope: RuntimeScope) => () => void;
  registerBindingScope: (bindingId: string, scope: RuntimeScope) => () => void;
};

function useApplicationVm(onUpdate: (registry: ApplicationVm) => void) {
  const vm: ApplicationVm = { scopes: {}, bindingScopes: {} };

  let scheduledUpdate: Promise<void> | undefined;
  const scheduleUpdate = () => {
    if (scheduledUpdate) {
      return;
    }
    scheduledUpdate = Promise.resolve().then(async () => {
      onUpdate(vm);
      // We seem to be hitting https://github.com/facebook/react/issues/24650
      // In the pageEditorReducer unless we schedule the next one in a new microtask
      await Promise.resolve();
      scheduledUpdate = undefined;
    });
  };

  return React.useRef<ApplicationVmApi>({
    registerScope(scope: RuntimeScope) {
      if (vm.scopes[scope.id]) {
        throw new Error(`Scope with id "${scope.id}" already registered`);
      }
      vm.scopes[scope.id] = scope;
      scheduleUpdate();
      return () => {
        delete vm.scopes[scope.id];
        scheduleUpdate();
      };
    },
    registerBindingScope(bindingId: string, scope: RuntimeScope) {
      if (vm.bindingScopes[bindingId]) {
        return () => {};
      }
      vm.bindingScopes[bindingId] = scope.id;
      scheduleUpdate();
      return () => {
        delete vm.bindingScopes[bindingId];
        scheduleUpdate();
      };
    },
  });
}

const ApplicationVmApiContext = React.createContext<
  React.MutableRefObject<ApplicationVmApi> | undefined
>(undefined);
const RuntimeScopeContext = React.createContext<RuntimeScope | undefined>(undefined);

const DomContext = React.createContext<appDom.AppDom | undefined>(undefined);
const useDomContext = () => useNonNullableContext(DomContext);

type EvaluateScopeExpression = (expr: string) => any;
const EvaluateScopeExpressionContext = React.createContext<EvaluateScopeExpression | undefined>(
  undefined,
);
const useEvaluateScopeExpression = () => useNonNullableContext(EvaluateScopeExpressionContext);

interface SetBindingContextValue {
  setBinding: (id: string, result: BindingEvaluationResult, scopeId?: string) => void;
  setControlledBinding: (id: string, result: BindingEvaluationResult, scopeId?: string) => void;
  setBindingByScopePath: (
    scopePath: string,
    result: BindingEvaluationResult,
    scopeId?: string,
  ) => void;
}

const SetBindingContext = React.createContext<SetBindingContextValue | undefined>(undefined);

function getComponentId(elm: appDom.ElementNode): string {
  const componentId = getElementNodeComponentId(elm);
  return componentId;
}

/**
 * Turns an object consisting of a nested structure of BindableAttrValues
 * into a flat array of relative paths associated with their value.
 * Example:
 *   { foo: { bar: 1 }, baz: [{ $$jsExpression: 'quux' }] }
 *   =>
 *   [
 *    ['.foo.bar', 1],
 *    ['.baz[0]', { $$jsExpression: 'quux' }]
 *   ]
 */
function flattenNestedBindables(
  params?: NestedBindableAttrs,
  prefix = '',
): [string, BindableAttrValue<any>][] {
  if (!params) {
    return [];
  }
  if (Array.isArray(params)) {
    return params.flatMap((param, i) => {
      return flattenNestedBindables(param[1], `${prefix}[${i}][1]`);
    });
  }
  // TODO: create a marker in bindables (similar to $ref) to recognize them automatically
  // in a nested structure. This would allow us to build deeply nested structures
  if (typeof params !== 'object' || getBindingType(params) !== 'const') {
    return [[prefix, params as BindableAttrValue<any>]];
  }
  return Object.entries(params).flatMap(([key, param]) =>
    flattenNestedBindables(param, `${prefix}.${key}`),
  );
}

/**
 * Returns an object with the resolved values of the bindables.
 * Example bindings:
 * {
 *  'nodeId.params.order': { error: undefined, loading: false, value: { "OrderID": "" } },
 * }
 * Example bindingId: 'nodeId.params'
 * Example params:
 * {
 * ["order", { $$jsExpression: 'form.value\n' }]
 * }
 * Example result:
 * {
 * order: { "OrderID": "" }
 * }
 */

function resolveBindables(
  bindings: Partial<Record<string, BindingEvaluationResult>>,
  bindingId: string,
  params?: NestedBindableAttrs,
): BindingEvaluationResult<Record<string, unknown>> {
  const result: any = {};
  const resultKey = 'value';
  const flattened = flattenNestedBindables(params);

  for (const [path] of flattened) {
    const resolvedBinding = bindings[`${bindingId}${path}`];

    if (resolvedBinding?.error) {
      return { error: resolvedBinding?.error };
    }
    if (resolvedBinding?.loading) {
      return { loading: true };
    }

    setObjectPath(result, `${resultKey}${path}`, resolvedBinding?.value);
  }

  return { value: result[resultKey] || {} };
}

interface ParseBindingOptions {
  scopePath?: string;
}

function parseBinding(
  bindable: BindableAttrValue<any>,
  { scopePath }: ParseBindingOptions = {},
): ParsedBinding | EvaluatedBinding {
  const bindingType = getBindingType(bindable);

  if (bindingType === 'const') {
    return {
      scopePath,
      result: { value: bindable },
    };
  }

  if (bindingType === 'env') {
    return {
      scopePath,
      result: { value: bindable },
    };
  }
  if (bindingType === 'jsExpression') {
    return {
      scopePath,
      expression: bindable.$$jsExpression,
    };
  }
  return {
    scopePath,
    result: { value: undefined },
  };
}

/**
 * Returns all elements for the current scope. This includes the root node and all of its descendants.
 * Templates are not included.
 */
function getScopeElements(
  dom: appDom.AppDom,
  rootNode: appDom.AppDomNode | appDom.AppDomNode[],
  components: ToolpadComponents,
): readonly appDom.AppDomNode[] {
  if (Array.isArray(rootNode)) {
    return [...rootNode, ...rootNode.flatMap((child) => getScopeElements(dom, child, components))];
  }

  const childNodes = appDom.getChildNodes(dom, rootNode);
  const result: appDom.AppDomNode[] = [];

  for (const [prop, children] of Object.entries(childNodes) as [string, appDom.AppDomNode[]][]) {
    if (appDom.isElement(rootNode)) {
      const componentId = getComponentId(rootNode);
      const Component = components[componentId];
      const componentConfig = Component?.[TOOLPAD_COMPONENT];
      const { argTypes = {} } = componentConfig ?? {};

      if (argTypes[prop]?.type !== 'template') {
        result.push(
          ...children,
          ...children.flatMap((child) => getScopeElements(dom, child, components)),
        );
      }
    } else {
      result.push(
        ...children,
        ...children.flatMap((child) => getScopeElements(dom, child, components)),
      );
    }
  }

  return result;
}

function getQueryConfigBindings({ enabled, refetchInterval }: appDom.QueryNode['attributes']) {
  return { enabled, refetchInterval };
}

function isBindableProp(componentConfig: ComponentConfig<any>, propName: string) {
  const argType = componentConfig.argTypes?.[propName];
  return (
    argType?.control?.bindable !== false &&
    argType?.type !== 'template' &&
    argType?.type !== 'event'
  );
}

function parseBindings(
  dom: appDom.AppDom,
  rootNode: appDom.ElementNode | appDom.PageNode | appDom.ElementNode[],
  components: ToolpadComponents,
  location: RouterLocation,
) {
  const scopeElements = getScopeElements(dom, rootNode, components);

  const parsedBindingsMap = new Map<string, ParsedBinding | EvaluatedBinding>();
  const controlled = new Set<string>();
  const scopeMeta: ScopeMeta = {};

  for (const elm of scopeElements) {
    if (appDom.isElement<any>(elm)) {
      const componentId = getComponentId(elm);
      const Component = components[componentId];

      const componentConfig: ComponentConfig<any> = Component?.[TOOLPAD_COMPONENT] ?? {};

      const { argTypes = {} } = componentConfig;

      const propsMeta: Record<string, ScopeMetaPropField> = {};

      for (const [propName, argType] of Object.entries(argTypes)) {
        invariant(argType, `Missing argType for prop "${propName}"`);

        const initializerExpression = argType.defaultValueProp
          ? `${elm.name}.${argType.defaultValueProp}`
          : JSON.stringify(getArgTypeDefaultValue(argType));

        const propValue: BindableAttrValue<any> = elm.props?.[propName];

        const binding: BindableAttrValue<any> = propValue ?? getArgTypeDefaultValue(argType);

        const bindingId = `${elm.id}.props.${propName}`;

        let scopePath: string | undefined;

        if (componentId !== PAGE_ROW_COMPONENT_ID && isBindableProp(componentConfig, propName)) {
          scopePath = `${elm.name}.${propName}`;
        }

        propsMeta[propName] = {
          tsType: argType?.tsType,
        };

        if (argType) {
          if (argType.onChangeProp) {
            controlled.add(bindingId);
            parsedBindingsMap.set(bindingId, {
              scopePath,
              initializer: initializerExpression,
            });
          } else {
            parsedBindingsMap.set(bindingId, parseBinding(binding, { scopePath }));
          }
        }

        const parseNestedBindings = (value: unknown, parentBindingId: string) => {
          if (value && typeof value === 'object') {
            for (const [nestedPropName, nestedProp] of Object.entries(value)) {
              const nestedBindingId = `${parentBindingId}${
                Array.isArray(value) ? `[${nestedPropName}]` : `.${nestedPropName}`
              }`;

              if (nestedProp && getBindingType(nestedProp) !== 'const') {
                parsedBindingsMap.set(nestedBindingId, parseBinding(nestedProp));
              } else {
                parseNestedBindings(
                  (value as Record<string, unknown>)[nestedPropName],
                  nestedBindingId,
                );
              }
            }
          }
        };

        const propBindingValue = propValue && getBindingValue(propValue);
        parseNestedBindings(propBindingValue, bindingId);
      }

      if (componentId !== PAGE_ROW_COMPONENT_ID) {
        scopeMeta[elm.name] = {
          kind: 'element',
          componentId,
          props: propsMeta,
        };
      }

      if (!isPageLayoutComponent(elm)) {
        for (const [propName, argType] of Object.entries(layoutBoxArgTypes)) {
          const binding =
            elm.layout?.[propName as keyof typeof layoutBoxArgTypes] ??
            (argType ? getArgTypeDefaultValue(argType) : undefined);
          const bindingId = `${elm.id}.layout.${propName}`;
          parsedBindingsMap.set(bindingId, parseBinding(binding, {}));
        }
      }
    }

    if (appDom.isQuery(elm)) {
      let kind: 'query' | 'action' = 'query';
      if (elm.attributes.mode === 'mutation') {
        kind = 'action';
      }
      scopeMeta[elm.name] = {
        kind,
      };

      if (elm.params) {
        const nestedBindablePaths = flattenNestedBindables(Object.fromEntries(elm.params ?? []));

        for (const [nestedPath, paramValue] of nestedBindablePaths) {
          const bindingId = `${elm.id}.params${nestedPath}`;
          const scopePath = `${elm.name}.params${nestedPath}`;
          const bindable = paramValue;
          parsedBindingsMap.set(bindingId, parseBinding(bindable, { scopePath }));
        }
      }

      for (const [key, value] of Object.entries(INITIAL_FETCH)) {
        const bindingId = `${elm.id}.${key}`;
        const scopePath = `${elm.name}.${key}`;
        controlled.add(bindingId);
        parsedBindingsMap.set(bindingId, {
          scopePath,
          result: { value, loading: true },
        });
      }

      const configBindings = getQueryConfigBindings(elm.attributes);
      const nestedBindablePaths = flattenNestedBindables(configBindings);

      for (const [nestedPath, paramValue] of nestedBindablePaths) {
        const bindingId = `${elm.id}.config${nestedPath}`;
        const scopePath = `${elm.name}.config${nestedPath}`;
        const bindable = paramValue;
        parsedBindingsMap.set(bindingId, parseBinding(bindable, { scopePath }));
      }
    }

    if (appDom.isMutation(elm)) {
      if (elm.params) {
        for (const [paramName, bindable] of Object.entries(elm.params)) {
          const bindingId = `${elm.id}.params.${paramName}`;
          const scopePath = `${elm.name}.params.${paramName}`;

          const bindingType = getBindingType(bindable);
          if (bindingType === 'const') {
            parsedBindingsMap.set(bindingId, {
              scopePath,
              result: { value: bindable },
            });
          } else if (bindingType === 'jsExpression') {
            parsedBindingsMap.set(bindingId, {
              scopePath,
              expression: (bindable as JsExpressionAttrValue).$$jsExpression,
            });
          }
        }
      }

      for (const [key, value] of Object.entries(INITIAL_FETCH)) {
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

  if (!Array.isArray(rootNode) && appDom.isPage(rootNode)) {
    if (location && !Array.isArray(rootNode) && appDom.isPage(rootNode)) {
      const urlParams = new URLSearchParams(location.search);
      const pageParameters = rootNode.attributes.parameters || [];

      for (const [paramName, paramDefault] of pageParameters) {
        const bindingId = `${rootNode.id}.parameters.${paramName}`;
        const scopePath = `page.parameters.${paramName}`;
        parsedBindingsMap.set(bindingId, {
          scopePath,
          result: { value: urlParams.get(paramName) || paramDefault },
        });
      }
    }
  }

  const parsedBindings: Record<string, ParsedBinding | EvaluatedBinding> =
    Object.fromEntries(parsedBindingsMap);

  return { parsedBindings, controlled, scopeMeta };
}

function useElmToolpadComponent(elm: appDom.ElementNode): ToolpadComponent {
  const componentId = getElementNodeComponentId(elm);
  return useComponent(componentId);
}

function RenderedNode({ nodeId }: RenderedNodeProps) {
  const dom = useDomContext();
  const node = appDom.getNode(dom, nodeId, 'element');
  const Component: ToolpadComponent<any> = useElmToolpadComponent(node);
  const childNodeGroups = appDom.getChildNodes(dom, node);

  return (
    <RenderedNodeContent node={node} childNodeGroups={childNodeGroups} Component={Component} />
  );
}

interface RuntimeScopedProps {
  id: string;
  parseBindingsResult: ReturnType<typeof parseBindings>;
  localScope?: Record<string, unknown>;
  onUpdate?: (params: { scope: RuntimeScope; scopeMeta: ScopeMeta }) => void;
  children?: React.ReactNode;
}

function RuntimeScoped({
  id,
  parseBindingsResult,
  localScope,
  onUpdate,
  children,
}: RuntimeScopedProps) {
  const parentScope = React.useContext(RuntimeScopeContext);
  const dom = useDomContext();

  const { parsedBindings, controlled, scopeMeta } = parseBindingsResult;

  const [scopeBindings, setScopeBindings] =
    React.useState<Record<string, ParsedBinding | EvaluatedBinding>>(parsedBindings);

  const prevDom = React.useRef(dom);
  React.useEffect(() => {
    if (dom === prevDom.current) {
      // Ignore this effect if there are no dom updates.
      // IMPORTANT!!! This assumes the `RenderedPage` component is remounted when the `nodeId` changes
      //  <RenderedPage nodeId={someId} key={someId} />
      return;
    }
    prevDom.current = dom;

    setScopeBindings((existingBindings) => {
      // Make sure to patch page bindings after dom nodes have been added or removed
      const updated: Record<string, ParsedBinding | EvaluatedBinding> = {};
      for (const [key, binding] of Object.entries(parsedBindings)) {
        updated[key] = controlled.has(key) ? existingBindings[key] || binding : binding;
      }
      return updated;
    });
  }, [parsedBindings, controlled, dom]);

  const { setBindingByScopePath: setParentBindingByScopePath } =
    React.useContext(SetBindingContext) ?? {};

  const setBinding = React.useCallback(
    (bindingId: string, result: BindingEvaluationResult) => {
      setScopeBindings((existingBindings): Record<string, ParsedBinding | EvaluatedBinding> => {
        const { expression, initializer, ...parsedBinding } = parsedBindings[bindingId];
        const existingBinding = existingBindings[bindingId];

        if (existingBinding?.result && isEqual(existingBinding.result, result)) {
          return existingBindings;
        }

        return {
          ...existingBindings,
          ...{
            [bindingId]: { ...parsedBinding, result },
          },
        };
      });
    },
    [parsedBindings],
  );

  const bindingsByScopePath = React.useMemo(
    () =>
      new Map<string, string>(
        Object.entries(scopeBindings).map(
          ([bindingId, binding]) => [binding.scopePath, bindingId] as [string, string],
        ),
      ),
    [scopeBindings],
  );

  const setBindingByScopePath = React.useCallback(
    (scopePath: string, result: BindingEvaluationResult) => {
      const bindingToUpdateId = bindingsByScopePath.get(scopePath);
      if (bindingToUpdateId) {
        setBinding(bindingToUpdateId, result);
      } else if (setParentBindingByScopePath) {
        setParentBindingByScopePath(scopePath, result);
      } else {
        throw new Error(`No binding found for scope path "${scopePath}"`);
      }
    },
    [bindingsByScopePath, setBinding, setParentBindingByScopePath],
  );

  const setControlledBinding = React.useCallback(
    (bindingId: string, result: BindingEvaluationResult) => {
      if (!controlled.has(bindingId)) {
        throw new Error(`Not a controlled binding "${bindingId}"`);
      }

      setBinding(bindingId, result);
    },
    [controlled, setBinding],
  );

  const childScope = React.useMemo(
    () =>
      createScope(id, scopeBindings, {
        localValues: localScope,
        parentScope,
        meta: scopeMeta,
      }),
    [id, localScope, parentScope, scopeBindings, scopeMeta],
  );

  const vmRef = React.useContext(ApplicationVmApiContext);
  React.useEffect(() => {
    if (!vmRef) {
      return () => {};
    }
    return vmRef.current.registerScope(childScope);
  }, [vmRef, childScope]);

  const evaluateScopeExpression = React.useCallback(
    async (expression: string) => {
      const updates: Record<string, unknown> = {};

      const proxify = <T extends object>(obj: T, scopePathSegments: string[]): T => {
        return new Proxy(obj, {
          get(target, prop, receiver) {
            if (typeof prop === 'symbol') {
              return Reflect.get(target, prop, receiver);
            }

            const result = target[prop as keyof T];

            if (result && typeof result === 'object') {
              return proxify(result, [...scopePathSegments, prop]);
            }

            return Reflect.get(target, prop, receiver);
          },
          set(target, prop, newValue, receiver) {
            if (typeof prop === 'symbol') {
              return Reflect.set(target, prop, newValue, receiver);
            }

            const scopePath = [...scopePathSegments, prop].join('.');
            updates[scopePath] = newValue;
            return Reflect.set(target, prop, newValue, receiver);
          },
        });
      };

      const scopeValues = childScope.values;
      const result = browserJsRuntime.evaluateExpression(expression, proxify(scopeValues, []));

      await result.value;

      for (const [scopePath, newValue] of Object.entries(updates)) {
        setBindingByScopePath(scopePath, { value: newValue });
      }

      return result;
    },
    [childScope.values, setBindingByScopePath],
  );

  React.useEffect(() => {
    onUpdate?.({
      scopeMeta,
      scope: childScope,
    });
  }, [scopeMeta, childScope, onUpdate]);

  const setBindingContext = React.useMemo<SetBindingContextValue>(
    () => ({
      setBinding,
      setControlledBinding,
      setBindingByScopePath,
    }),
    [setBinding, setControlledBinding, setBindingByScopePath],
  );

  return (
    <RuntimeScopeContext.Provider value={childScope}>
      <SetBindingContext.Provider value={setBindingContext}>
        <EvaluateScopeExpressionContext.Provider value={evaluateScopeExpression}>
          {children}
        </EvaluateScopeExpressionContext.Provider>
      </SetBindingContext.Provider>
    </RuntimeScopeContext.Provider>
  );
}

interface TemplateScopedProps {
  id: string;
  propName: string;
  node: appDom.ElementNode;
  localScope: Record<string, unknown>;
  children?: React.ReactNode;
}

function TemplateScoped({ id, node, localScope, propName, children }: TemplateScopedProps) {
  const dom = useDomContext();
  const components = useComponents();
  const location = useLocation();

  const parseBindingsResult = React.useMemo(() => {
    const { [propName]: templateChildren = [] } = appDom.getChildNodes(dom, node);
    return parseBindings(dom, templateChildren, components, location);
  }, [components, dom, node, propName, location]);

  return (
    <RuntimeScoped id={id} parseBindingsResult={parseBindingsResult} localScope={localScope}>
      {children}
    </RuntimeScoped>
  );
}

function NodeError({ error }: NodeErrorProps) {
  return (
    <Tooltip title={error.message}>
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8,
          background: 'red',
          color: 'white',
        }}
      >
        <ErrorIcon color="inherit" style={{ marginRight: 8 }} /> Error
      </span>
    </Tooltip>
  );
}

interface RenderedNodeContentProps {
  node: appDom.PageNode | appDom.ElementNode;
  childNodeGroups: appDom.NodeChildren<appDom.ElementNode>;
  Component: ToolpadComponent<any>;
  staticProps?: Record<string, any>;
}

function RenderedNodeContent({
  node,
  childNodeGroups,
  Component,
  staticProps,
}: RenderedNodeContentProps) {
  const { setControlledBinding } = React.useContext(SetBindingContext) ?? {};
  invariant(setControlledBinding, 'Node must be rendered in a RuntimeScoped context');

  const nodeId = node.id;

  const componentConfig = Component[TOOLPAD_COMPONENT];
  const {
    argTypes = {},
    errorProp,
    loadingProp,
    loadingPropSource,
    errorPropSource,
  } = componentConfig;

  const isLayoutNode =
    appDom.isPage(node) || (appDom.isElement(node) && isPageLayoutComponent(node));

  const scope = useAssertedContext(RuntimeScopeContext);
  const liveBindings = scope.bindings;

  const boundProps: Record<string, any> = React.useMemo(() => {
    const loadingPropSourceSet = loadingPropSource ? new Set(loadingPropSource) : null;
    const errorPropSourceSet = errorPropSource ? new Set(errorPropSource) : null;
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

        if (binding.loading && (!loadingPropSourceSet || loadingPropSourceSet.has(propName))) {
          loading = true;
        } else if (
          !error &&
          binding.error &&
          (!errorPropSourceSet || errorPropSourceSet.has(propName))
        ) {
          error = binding.error;
        }
      }

      if (typeof hookResult[propName] === 'undefined' && argType) {
        const defaultValue = getArgTypeDefaultValue(argType);
        if (typeof defaultValue !== 'undefined') {
          hookResult[propName] = getArgTypeDefaultValue(argType);
        }
      }
    }

    if (error) {
      if (errorProp) {
        hookResult[errorProp] = error;
      } else {
        console.error(errorFrom(error));
      }
    }

    if (loadingProp && loading) {
      hookResult[loadingProp] = true;
    }

    return hookResult;
  }, [argTypes, errorProp, errorPropSource, liveBindings, loadingProp, loadingPropSource, nodeId]);

  const boundLayoutProps: Record<string, any> = React.useMemo(() => {
    const hookResult: Record<string, any> = {};

    for (const [propName, argType] of isLayoutNode ? [] : Object.entries(layoutBoxArgTypes)) {
      const bindingId = `${nodeId}.layout.${propName}`;
      const binding = liveBindings[bindingId];
      if (binding) {
        hookResult[propName] = binding.value;
      }

      if (typeof hookResult[propName] === 'undefined' && argType) {
        hookResult[propName] = getArgTypeDefaultValue(argType);
      }
    }

    return hookResult;
  }, [isLayoutNode, liveBindings, nodeId]);

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

  const navigateToPage = usePageNavigator();
  const evaluateScopeExpression = useEvaluateScopeExpression();

  const eventHandlers: Record<string, (param: any) => void> = React.useMemo(() => {
    return mapProperties(argTypes, ([key, argType]) => {
      if (!argType || argType.type !== 'event' || !appDom.isElement(node)) {
        return null;
      }

      const action = (node as appDom.ElementNode).props?.[key];

      if (action?.$$navigationAction) {
        const handler = async () => {
          const { page, parameters = {} } = action.$$navigationAction;
          if (page) {
            const parsedParameterEntries = await Promise.all(
              Object.keys(parameters).map(async (parameterName) => {
                const parameterValue = parameters[parameterName];

                if (parameterValue?.$$jsExpression) {
                  const result = await evaluateScopeExpression(parameterValue.$$jsExpression);
                  return [parameterName, result.value];
                }
                return [parameterName, parameterValue];
              }),
            );

            const parsedParameters = Object.fromEntries(parsedParameterEntries);

            navigateToPage(page, parsedParameters);
          }
        };

        return [key, handler];
      }

      if (action?.$$jsExpressionAction) {
        const handler = () => {
          const code = action.$$jsExpressionAction;
          const exprToEvaluate = `(async () => {${code}})()`;
          evaluateScopeExpression(exprToEvaluate);
        };

        return [key, handler];
      }

      return null;
    });
  }, [argTypes, node, navigateToPage, evaluateScopeExpression]);

  const reactChildren = React.useMemo(() => {
    const result: Record<string, React.ReactNode> = {};
    for (const [prop, childNodes] of Object.entries(childNodeGroups)) {
      result[prop] = childNodes.map((child) => <RenderedNode key={child.id} nodeId={child.id} />);
    }
    return result;
  }, [childNodeGroups]);

  const layoutElementProps = React.useMemo(() => {
    if (appDom.isElement(node) && isPageRow(node)) {
      return {
        layoutColumnSizes: childNodeGroups.children.map((child) => child.layout?.columnSize),
      };
    }
    return {};
  }, [childNodeGroups.children, node]);

  const props: Record<string, any> = React.useMemo(() => {
    return {
      ...staticProps,
      ...boundProps,
      ...onChangeHandlers,
      ...eventHandlers,
      ...layoutElementProps,
      ...reactChildren,
    };
  }, [staticProps, boundProps, eventHandlers, layoutElementProps, onChangeHandlers, reactChildren]);

  const previousProps = React.useRef<Record<string, any>>(props);
  const [hasSetInitialBindings, setHasSetInitialBindings] = React.useState(false);
  React.useEffect(() => {
    Object.entries(argTypes).forEach(([key, argType]) => {
      if (!argType?.defaultValueProp) {
        return;
      }

      if (
        hasSetInitialBindings &&
        previousProps.current[argType.defaultValueProp] === props[argType.defaultValueProp]
      ) {
        return;
      }

      const bindingIdToUpdate = `${nodeId}.props.${key}`;
      setControlledBinding(bindingIdToUpdate, { value: props[argType.defaultValueProp] });
    });

    previousProps.current = props;
    setHasSetInitialBindings(true);
  }, [props, argTypes, nodeId, setControlledBinding, hasSetInitialBindings]);

  const wrappedProps = React.useMemo(() => {
    const hookResult: Record<string, any> = { ...props };
    // Wrap element props
    for (const [propName, argType] of Object.entries(argTypes)) {
      const isElement = argType?.type === 'element';
      const isTemplate = argType?.type === 'template';

      if (isElement || isTemplate) {
        const value = hookResult[propName];

        let wrappedValue = value;
        if (argType.control?.type === 'slots' || argType.control?.type === 'layoutSlot') {
          wrappedValue = (
            <Slots prop={propName} hasLayout={argType.control?.type === 'layoutSlot'}>
              {value}
            </Slots>
          );
        } else if (argType.control?.type === 'slot') {
          wrappedValue = <Placeholder prop={propName}>{value}</Placeholder>;
        }

        if (isTemplate) {
          appDom.assertIsElement(node);
          hookResult[propName] = (key: string, localScope: Record<string, unknown>) => {
            return (
              <TemplateScoped
                id={`${node.id}.props.${propName}.${key}`}
                localScope={localScope}
                node={node}
                propName={propName}
              >
                {wrappedValue}
              </TemplateScoped>
            );
          };
        } else {
          hookResult[propName] = wrappedValue;
        }
      }
    }
    return hookResult;
  }, [argTypes, node, props]);

  const vmRef = React.useContext(ApplicationVmApiContext);
  React.useEffect(() => {
    if (!vmRef) {
      return () => {};
    }
    const unsubscribers: (() => void)[] = [];
    for (const propName of Object.keys(argTypes)) {
      const unsubscribe = vmRef.current.registerBindingScope(`${nodeId}.props.${propName}`, scope);
      unsubscribers.push(unsubscribe);
    }
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [nodeId, argTypes, vmRef, scope]);

  const nodeRef = React.useRef();

  const canvasHooks = React.useContext(CanvasHooksContext);

  React.useEffect(() => {
    return canvasHooks.registerNode?.(node, wrappedProps, componentConfig, nodeRef.current);
  }, [node, wrappedProps, componentConfig, canvasHooks]);

  return (
    <NodeRuntimeWrapper nodeId={nodeId} nodeName={node.name} NodeError={NodeError}>
      {isLayoutNode ? (
        <Component
          {...wrappedProps}
          ref={nodeRef}
          data-toolpad-node-id={nodeId}
          data-toolpad-slot-name="children"
          data-toolpad-slot-parent={nodeId}
          data-toolpad-slot-type="multiple"
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: boundLayoutProps.verticalAlign,
            justifyContent: boundLayoutProps.horizontalAlign,
            height: node.layout?.height ?? componentConfig.defaultLayoutHeight,
            minHeight: '100%',
            '&:empty': {
              display: 'none',
            },
          }}
          ref={nodeRef}
          data-toolpad-node-id={nodeId}
        >
          <Component {...wrappedProps} />
        </Box>
      )}
    </NodeRuntimeWrapper>
  );
}

interface PageRootProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
  children?: React.ReactNode;
}

const PageRoot = React.forwardRef<HTMLDivElement, PageRootProps>(function PageRoot(
  { children, maxWidth, ...props }: PageRootProps,
  ref,
) {
  const containerMaxWidth =
    maxWidth === 'none' ? false : (maxWidth ?? appDom.DEFAULT_CONTAINER_WIDTH);
  return (
    <Container ref={ref} maxWidth={containerMaxWidth}>
      <Stack data-testid="page-root" direction="column" sx={{ my: 2, gap: 1 }} {...props}>
        {children}
      </Stack>
    </Container>
  );
});

const PageRootComponent = createComponent(PageRoot, {
  argTypes: {
    children: {
      type: 'element',
      control: { type: 'slots' },
    },
    maxWidth: {
      type: 'string',
      enum: ['xs', 'sm', 'md', 'lg', 'xl', 'none'],
      control: { type: 'ToggleButtons' },
    },
  },
});

interface QueryNodeProps {
  page: appDom.PageNode;
  node: appDom.QueryNode;
}

function QueryNode({ page, node }: QueryNodeProps) {
  const { setControlledBinding } = React.useContext(SetBindingContext) ?? {};
  invariant(setControlledBinding, 'QueryNode must be rendered in a RuntimeScoped context');

  const { bindings } = useAssertedContext(RuntimeScopeContext);

  const params = resolveBindables(
    bindings,
    `${node.id}.params`,
    Object.fromEntries(node.params ?? []),
  );

  const configBindings = getQueryConfigBindings(node.attributes);
  const options = resolveBindables(bindings, `${node.id}.config`, configBindings);

  const inputError = params.error || options.error;
  const inputIsLoading = params.loading || options.loading;

  const queryResult = useDataQuery(page, node, params.value, {
    ...options.value,
    enabled: !inputIsLoading && !inputError,
  });

  React.useEffect(() => {
    const { isLoading: queryIsLoading, error: queryError, data, rows, ...result } = queryResult;

    const error = queryError || inputError;
    const isLoading = queryIsLoading || inputIsLoading;

    for (const [key, value] of Object.entries(result)) {
      const bindingId = `${node.id}.${key}`;
      setControlledBinding(bindingId, { value });
    }

    // Here we propagate the error and loading state to the data and rows properties
    // TODO: is there a straightforward way for us to generalize this behavior?
    setControlledBinding(`${node.id}.isLoading`, { value: isLoading });
    setControlledBinding(`${node.id}.error`, {
      value: error ? String(error.message || error) : undefined,
    });
    const deferredStatus = { loading: isLoading, error };
    setControlledBinding(`${node.id}.data`, { ...deferredStatus, value: data });
    setControlledBinding(`${node.id}.rows`, { ...deferredStatus, value: rows });
  }, [node.name, node.id, queryResult, setControlledBinding, inputError, inputIsLoading]);

  return null;
}

interface MutationNodeProps {
  page: appDom.PageNode;
  node: appDom.QueryNode;
}

function MutationNode({ node, page }: MutationNodeProps) {
  const { setControlledBinding } = React.useContext(SetBindingContext) ?? {};
  invariant(setControlledBinding, 'MutationNode must be rendered in a RuntimeScoped context');

  const { bindings } = useAssertedContext(RuntimeScopeContext);

  const { value: params } = resolveBindables(
    bindings,
    `${node.id}.params`,
    Object.fromEntries(node.params ?? []),
  );

  const runtimeApi = useNonNullableContext(RuntimeApiContext);

  const {
    isPending,
    data: responseData = EMPTY_OBJECT,
    error: fetchError,
    mutateAsync,
  } = useMutation({
    mutationKey: [node.name, params],
    mutationFn: async (overrides: any = {}) => {
      return runtimeApi.methods.execQuery(page.name, node.name, { ...params, ...overrides });
    },
  });

  const { data, error: apiError } = responseData || EMPTY_OBJECT;

  const error = apiError || fetchError;

  // Stabilize the mutation and prepare for inclusion in global scope
  const mutationResult: UseFetch = React.useMemo(() => {
    const call = async (overrides: any = {}) => {
      await mutateAsync(overrides);
    };
    return {
      isLoading: isPending,
      isFetching: isPending,
      error,
      data,
      rows: Array.isArray(data) ? data : EMPTY_ARRAY,
      call,
      fetch: call,
      refetch: () => {
        throw new Error(`refetch is not supported in manual queries`);
      },
    };
  }, [isPending, error, data, mutateAsync]);

  React.useEffect(() => {
    for (const [key, value] of Object.entries(mutationResult)) {
      const bindingId = `${node.id}.${key}`;
      setControlledBinding(bindingId, { value });
    }
  }, [node.id, mutationResult, setControlledBinding]);

  return null;
}

interface FetchNodeProps {
  page: appDom.PageNode;
  node: appDom.QueryNode;
}

function FetchNode({ node, page }: FetchNodeProps) {
  const mode: appDom.FetchMode = node.attributes.mode || 'query';
  switch (mode) {
    case 'query':
      return <QueryNode node={node} page={page} />;
    case 'mutation':
      return <MutationNode node={node} page={page} />;
    default:
      throw new Error(`Unrecognized fetch mode "${mode}"`);
  }
}

interface RenderedLowCodePageProps {
  page: appDom.PageNode;
}

function RenderedLowCodePage({ page }: RenderedLowCodePageProps) {
  usePageTitle(appDom.getPageTitle(page));
  const dom = useDomContext();
  const { children = [], queries = [] } = appDom.getChildNodes(dom, page);

  const location = useLocation();
  const components = useComponents();

  const parseBindingsResult = React.useMemo(
    () => parseBindings(dom, page, components, location),
    [components, dom, location, page],
  );

  const canvasEvents = React.useContext(CanvasEventsContext);

  const onUpdate = useEventCallback(({ scope, scopeMeta }) => {
    if (canvasEvents) {
      canvasEvents.emit('pageStateUpdated', {
        pageState: scope.values,
        globalScopeMeta: scopeMeta,
      });
      canvasEvents.emit('pageBindingsUpdated', { bindings: scope.bindings });
    }
  });

  const onApplicationVmUpdate = useEventCallback((vm: ApplicationVm) => {
    if (canvasEvents) {
      canvasEvents.emit('vmUpdated', { vm });
    }
  });

  const applicationVm = useApplicationVm(onApplicationVmUpdate);

  const pageProps = React.useMemo(
    () => ({
      maxWidth: page.attributes.maxWidth,
    }),
    [page.attributes.maxWidth],
  );

  return (
    <ApplicationVmApiContext.Provider value={applicationVm}>
      <RuntimeScoped id={'global'} parseBindingsResult={parseBindingsResult} onUpdate={onUpdate}>
        <RenderedNodeContent
          node={page}
          childNodeGroups={{ children }}
          Component={PageRootComponent}
          staticProps={pageProps}
        />
        {queries.map((node) => (
          <FetchNode key={node.id} page={page} node={node} />
        ))}
      </RuntimeScoped>
    </ApplicationVmApiContext.Provider>
  );
}

export interface RenderedNodeProps {
  nodeId: NodeId;
}

export interface RenderedPageProps {
  page: appDom.PageNode;
}

export function RenderedPage({ page }: RenderedPageProps) {
  const appHost = useAppHost();

  let pageContent = <RenderedLowCodePage page={page} key={page.name} />;

  if (!appHost.isCanvas) {
    pageContent = (
      <RequireAuthorization
        allowAll={page.attributes.authorization?.allowAll ?? true}
        allowedRoles={page.attributes.authorization?.allowedRoles ?? []}
      >
        {pageContent}
      </RequireAuthorization>
    );
  }

  return pageContent;
}

interface PageNotFoundProps {
  msg?: React.ReactNode;
}

function PageNotFound({ msg = "The page doesn't exist in this application." }: PageNotFoundProps) {
  return (
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h1">Not found</Typography>
      <Typography>{msg}</Typography>
    </Container>
  );
}

function isPageAllowed(page: appDom.PageNode, session: AuthSession | null): boolean {
  const userRoles = session?.user?.roles ?? [];
  const { allowAll = true, allowedRoles = [] } = page.attributes.authorization ?? {};
  return allowAll || userRoles.some((role) => allowedRoles.includes(role));
}

const FullPageCentered = styled('div')({
  width: '100%',
  height: '100%',
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
        <Pre>{error.message}</Pre>
        <Pre>{error.stack}</Pre>
      </Alert>
    </FullPageCentered>
  );
}

function shouldShowPreviewHeader(appHost: AppHost): boolean {
  return !!appHost.isPreview && !appHost.isCanvas;
}

interface ToolpadAppLayoutProps {
  children?: React.ReactNode;
}

function ToolpadAppLayout({ children }: ToolpadAppLayoutProps) {
  const dom = useDomContext();

  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);

  const { session, hasAuthentication } = React.useContext(AuthContext);

  const pageMatch = useMatch('/pages/:slug');
  const activePageSlug = pageMatch?.params.slug;

  const navEntries = React.useMemo(
    () =>
      pages
        .filter((page) => isPageAllowed(page, session))
        .map((page) => ({
          slug: page.name,
          displayName: appDom.getPageDisplayName(page),
          hasShell: page?.attributes.display !== 'standalone',
        })),
    [pages, session],
  );

  const appHost = useAppHost();

  if (!appHost.isCanvas && !session?.user && hasAuthentication) {
    return <AppLoading />;
  }

  return (
    <AppLayout activePageSlug={activePageSlug} pages={navEntries} hasLayout={!appHost.isCanvas}>
      {children}
    </AppLayout>
  );
}

function PageRoute() {
  const { pageName } = useParams();

  invariant(pageName, 'Page name must be provided as a route parameter');

  const dom = useDomContext();
  const { search } = useLocation();

  const page = appDom.getPageByName(dom, pageName);

  if (!page) {
    const aliasedPageName = appDom.getPageForAlias(dom, pageName);

    if (aliasedPageName) {
      return <Navigate to={`/pages/${aliasedPageName}${search}`} replace />;
    }

    return <PageNotFound />;
  }

  return <RenderedPage page={page} />;
}

function PagesLayoutRoute() {
  return (
    <ToolpadAppLayout>
      <Outlet />
    </ToolpadAppLayout>
  );
}

function DefaultPageRoute() {
  const { search } = useLocation();
  const dom = useDomContext();
  const { session } = React.useContext(AuthContext);

  const root = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, root);

  const defaultPage: appDom.PageNode | null = React.useMemo(
    () => pages.find((page) => isPageAllowed(page, session)) ?? null,
    [pages, session],
  );

  return defaultPage ? (
    <Navigate to={`/pages/${defaultPage.name}${search}`} replace />
  ) : (
    <PageNotFound msg="No pages available." />
  );
}

export interface ToolpadAppProviderProps extends ToolpadAppProps {
  children?: React.ReactNode;
}

export function ToolpadAppProvider({
  rootRef,
  basename,
  state,
  children,
  apiUrl = `${basename}/api/runtime-rpc`,
}: ToolpadAppProviderProps) {
  const { dom } = state;

  const extraComponents = componentsStore.useValue();

  const components = React.useMemo(
    () => ({ ...internalComponents, ...extraComponents }),
    [extraComponents],
  );

  const [resetNodeErrorsKey, setResetNodeErrorsKey] = React.useState(0);

  React.useEffect(() => setResetNodeErrorsKey((key) => key + 1), [dom]);

  const { value: showDevtools, toggle: toggleDevtools } = useBoolean(false);

  React.useEffect(() => {
    (window as any).toggleDevtools = () => toggleDevtools();
  }, [toggleDevtools]);

  const authContext = useAuth({ dom, basename, signInPagePath: '/signin' });

  const appHost = useAppHost();
  const showPreviewHeader = shouldShowPreviewHeader(appHost);

  const canvasHooks = React.useContext(CanvasHooksContext);

  const runtimeApi = React.useMemo(() => createApi(apiUrl), [apiUrl]);

  return (
    <RuntimeApiContext.Provider value={runtimeApi}>
      <UseDataProviderContext.Provider value={useDataProvider}>
        <ComponentsContextProvider value={components}>
          <DomContext.Provider value={dom}>
            <AuthContext.Provider value={authContext}>
              <ResetNodeErrorsKeyProvider value={resetNodeErrorsKey}>
                <AppThemeProvider dom={dom}>
                  <CssBaseline enableColorScheme />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100vh',
                    }}
                  >
                    {showPreviewHeader ? <PreviewHeader /> : null}
                    <AppRoot ref={rootRef}>
                      <ErrorBoundary FallbackComponent={AppError}>
                        <React.Suspense fallback={<AppLoading />}>{children}</React.Suspense>
                      </ErrorBoundary>
                      <EditorOverlay ref={canvasHooks.overlayRef} />
                    </AppRoot>
                  </Box>
                </AppThemeProvider>
              </ResetNodeErrorsKeyProvider>
            </AuthContext.Provider>
            {showDevtools ? <ReactQueryDevtoolsProduction initialIsOpen={false} /> : null}
          </DomContext.Provider>
        </ComponentsContextProvider>
      </UseDataProviderContext.Provider>
    </RuntimeApiContext.Provider>
  );
}

export interface ToolpadAppProps {
  rootRef?: React.Ref<HTMLDivElement>;
  basename: string;
  state: RuntimeState;
  apiUrl?: string;
}

export function ToolpadAppRoutes(props: ToolpadAppProps) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ToolpadAppProvider {...props}>
            <Outlet />
          </ToolpadAppProvider>
        }
      >
        <Route path="/signin" Component={SignInPage} />
        <Route path="/" Component={PagesLayoutRoute}>
          <Route path="/pages/:pageName" Component={PageRoute} />
          <Route path="/pages" Component={DefaultPageRoute} />
          <Route path="/" Component={DefaultPageRoute} />
          <Route path="*" Component={PageNotFound} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function ToolpadApp(props: ToolpadAppProps) {
  const isSsr = useSsr();
  return isSsr ? null : (
    <BrowserRouter basename={props.basename}>
      <Routes>
        <Route
          path="/"
          element={
            <ToolpadAppProvider {...props}>
              <Outlet />
            </ToolpadAppProvider>
          }
        >
          <Route path="/signin" Component={SignInPage} />
          <Route path="/" Component={PagesLayoutRoute}>
            <Route path="/pages/:pageName" Component={PageRoute} />
            <Route path="/pages" Component={DefaultPageRoute} />
            <Route path="/" Component={DefaultPageRoute} />
            <Route path="*" Component={PageNotFound} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
