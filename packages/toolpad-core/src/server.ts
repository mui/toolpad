/// <reference path="./serverModules.d.ts" />

import { TOOLPAD_FUNCTION } from './constants';
import {
  InferParameterType,
  PaginationMode,
  PrimitiveValueType,
  PropValueType,
  ToolpadDataProviderBase,
} from './types';
import { ServerContext, __initContextStore, getServerContext } from './serverRuntime';

/**
 * The runtime configuration for a Toolpad function. Describes the parameters it accepts and their
 * corresponding types.
 */
export interface CreateFunctionConfig<C> {
  parameters: {
    [K in keyof C]: PrimitiveValueType;
  };
}

type CreateFunctionConfigParameters<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
> = FunctionResolverParams<C>['parameters'];

export interface FunctionResolverParams<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
> {
  parameters: {
    [K in keyof C['parameters']]: InferParameterType<C['parameters'][K]>;
  };
}

export interface FunctionResolver<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
  R,
> {
  (params: FunctionResolverParams<C>): Promise<R>;
}

export interface ToolpadFunction<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
  R,
> extends FunctionResolver<C, R> {
  [TOOLPAD_FUNCTION]: C;
}

type MaybeLegacyParametersDefinition = PropValueType & {
  typeDef?: PropValueType;
  defaultValue?: any;
};

/**
 * @deprecated Directly export a function instead. This will be removed in a future release.
 * See: https://mui.com/toolpad/reference/api/create-function/
 * Use this to define a function that will load the data for a Toolpad query.
 * You can define parameters for the function in the configuration object.
 * These parameters will be available in the Toolpad editor when creating a query and can be bound to page state.
 * The return value of this function will appear as state on the page and can be bound to.
 * @param resolver The function that will load the data for the query.
 * @param config The configuration for the function.
 * override: Config
 */
export function createFunction<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
  R,
>(resolver: FunctionResolver<C, R>, config?: C) {
  // TODO: Remove post beta
  if (config?.parameters) {
    for (const [name, argType] of Object.entries(config.parameters)) {
      const maybeLegacyParamtype = argType as MaybeLegacyParametersDefinition;
      if (maybeLegacyParamtype.typeDef) {
        console.warn(`Detected deprecated parameter definition for "${name}".`);
        Object.assign(maybeLegacyParamtype, maybeLegacyParamtype.typeDef);
        if (!('default' in maybeLegacyParamtype)) {
          maybeLegacyParamtype.default = maybeLegacyParamtype.defaultValue;
        }
        delete maybeLegacyParamtype.defaultValue;
        delete maybeLegacyParamtype.typeDef;
      }
    }
  }

  return Object.assign(resolver, {
    [TOOLPAD_FUNCTION]: config || { parameters: {} },
  });
}

/**
 * @deprecated
 * createQuery is deprecated. Use createFunction instead.
 */
export const createQuery = createFunction;

export type { ServerContext };

/**
 * Interact with the server context of a Toolpad application.
 * This function is only callable from within a Toolpad function.
 *
 * Demos:
 *
 * - [Custom Functions](https://mui.com/toolpad/concepts/custom-functions/#request-context/)
 *
 * API:
 *
 * - [`getContext` API](https://mui.com/toolpad/reference/api/get-context)
 *
 */
export function getContext(): ServerContext {
  const ctx = getServerContext();
  if (!ctx) {
    throw new Error('getContext() must be called from within a Toolpad function.');
  }
  return ctx;
}

export const TOOLPAD_DATA_PROVIDER_MARKER = Symbol.for('TOOLPAD_DATA_PROVIDER_MARKER');

export interface ToolpadDataProvider<
  R extends Record<string, unknown>,
  P extends PaginationMode = 'index',
> extends ToolpadDataProviderBase<R, P> {
  [TOOLPAD_DATA_PROVIDER_MARKER]: true;
}

/**
 * Create a Toolpad data provider. Data providers act as a bridge between Toolpad and your data.
 *
 * Demos:
 *
 * - [Data providers](https://mui.com/toolpad/concepts/data-providers/)
 *
 * API:
 *
 * - [`createDataProvider` API](https://mui.com/toolpad/reference/api/create-data-provider/)
 *
 */
export function createDataProvider<
  R extends Record<string, unknown>,
  P extends PaginationMode = 'index',
>(input: ToolpadDataProviderBase<R, P>): ToolpadDataProvider<R, P> {
  return Object.assign(input, { [TOOLPAD_DATA_PROVIDER_MARKER]: true as const });
}

export { __initContextStore };
