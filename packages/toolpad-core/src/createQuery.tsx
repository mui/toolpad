import { TOOLPAD_QUERY } from './constants.js';
import { PrimitiveValueType } from './types.js';

interface QueryParameterTypeLookup {
  number: number;
  string: string;
  boolean: boolean;
  array: unknown[];
  object: Record<string, unknown>;
}

/**
 * @deprecated
 * QueryParameterConfig is deprecated. Use FunctionParameterConfig instead.
 */
export interface QueryParameterConfig<P, K extends keyof P> {
  typeDef: PrimitiveValueType;
  defaultValue?: P[K];
}

/**
 * @deprecated
 * CreateQueryConfig is deprecated. Use CreateFunctionConfig instead.
 */
export interface CreateQueryConfig<P> {
  parameters: {
    [K in keyof P]: QueryParameterConfig<P, K>;
  };
}

type CreateQueryConfigParameters<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> =
  QueryResolverParams<C>['parameters'];

/**
 * @deprecated
 * QueryResolverParams is deprecated. Use FunctionResolverParams instead.
 */
export interface QueryResolverParams<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> {
  parameters: {
    [K in keyof C['parameters']]: QueryParameterTypeLookup[C['parameters'][K]['typeDef']['type']];
  };
}

/**
 * @deprecated
 * QueryResolver is deprecated. Use FunctionResolver instead.
 */
export interface QueryResolver<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> {
  (params: QueryResolverParams<C>): Promise<unknown>;
}

/**
 * @deprecated
 * ToolpadQuery is deprecated. Use ToolpaFunction instead.
 */
export interface ToolpadQuery<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>>
  extends QueryResolver<C> {
  [TOOLPAD_QUERY]: C;
}

/**
 * @deprecated
 * createQuery is deprecated. Use createFunction instead.
 */
export default function createQuery<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>>(
  resolver: QueryResolver<C>,
  config?: C,
) {
  return Object.assign(resolver, {
    [TOOLPAD_QUERY]: config || { parameters: {} },
  });
}
