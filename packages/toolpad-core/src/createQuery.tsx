import { TOOLPAD_QUERY } from './constants.js';
import { PrimitiveValueType } from './types.js';

interface QueryParameterTypeLookup {
  number: number;
  string: string;
  boolean: boolean;
  array: unknown[];
  object: Record<string, unknown>;
}

export interface QueryParameterConfig<P, K extends keyof P> {
  typeDef: PrimitiveValueType;
  defaultValue?: P[K];
}

export interface CreateQueryConfig<P> {
  parameters: {
    [K in keyof P]: QueryParameterConfig<P, K>;
  };
}

type CreateQueryConfigParameters<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> =
  QueryResolverParams<C>['parameters'];

export interface QueryResolverParams<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> {
  parameters: {
    [K in keyof C['parameters']]: QueryParameterTypeLookup[C['parameters'][K]['typeDef']['type']];
  };
}

export interface QueryResolver<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> {
  (params: QueryResolverParams<C>): Promise<unknown>;
}

export interface ToolpadQuery<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>>
  extends QueryResolver<C> {
  [TOOLPAD_QUERY]: C;
}

export default function createQuery<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>>(
  resolver: QueryResolver<C>,
  config?: C,
) {
  return Object.assign(resolver, {
    [TOOLPAD_QUERY]: config || { parameters: {} },
  });
}
