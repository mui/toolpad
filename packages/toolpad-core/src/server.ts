/// <reference path="./serverModules.d.ts" />

import { AsyncLocalStorage } from 'node:async_hooks';
import { IncomingMessage } from 'node:http';
import * as cookie from 'cookie';
import { TOOLPAD_FUNCTION } from './constants';
import { InferParameterType, PrimitiveValueType, PropValueType } from './types';

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

export interface ServerContext {
  cookies: Record<string, string>;
}

const asyncLocalStorage = new AsyncLocalStorage<ServerContext>();

export function getContext(): ServerContext {
  const ctx = asyncLocalStorage.getStore();
  if (!ctx) {
    throw new Error('getContext() must be called from within a Toolpad function.');
  }
  return ctx;
}

export function createServerContext(req: IncomingMessage): ServerContext {
  const cookies = cookie.parse(req.headers.cookie || '');
  return {
    cookies,
  };
}

export function withContext<R = void>(ctx: ServerContext, doWork: () => Promise<R>): Promise<R> {
  return asyncLocalStorage.run(ctx, doWork);
}

export const TOOLPAD_DATA_PROVIDER_MARKER = Symbol.for('TOOLPAD_DATA_PROVIDER_MARKER');

export interface IndexPaginationModel {
  start?: number;
  pageSize: number;
}

export interface CursorPaginationModel {
  cursor?: string;
  pageSize: number;
}

export type PaginationMode = 'index' | 'cursor';

export interface GetRecordsParams<R, P extends PaginationMode> {
  paginationModel: P extends 'cursor' ? CursorPaginationModel : IndexPaginationModel;
  // filterModel: FilterModel;
  // sortModel: SortModel;
}

export interface GetRecordsResult<R> {
  records: R[];
}

export interface ToolpadDataProviderInput<R, P extends PaginationMode = 'index'> {
  paginationMode?: P;
  getRecords: (params: GetRecordsParams<R, P>) => Promise<GetRecordsResult<R>>;
  // updateRecord?: (id: string, record: R) => Promise<void>;
  // deleteRecord?: (id: string) => Promise<void>;
  // createRecord?: (record: R) => Promise<void>;
}

export interface ToolpadDataProvider<R, P extends PaginationMode = 'index'>
  extends ToolpadDataProviderInput<R, P> {
  [TOOLPAD_DATA_PROVIDER_MARKER]: true;
}

export function createDataProvider<R, P extends PaginationMode = 'index'>(
  input: ToolpadDataProviderInput<R, P>,
): ToolpadDataProvider<R, P> {
  return Object.assign(input, { [TOOLPAD_DATA_PROVIDER_MARKER]: true as const });
}
