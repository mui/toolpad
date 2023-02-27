import { TOOLPAD_QUERY } from './constants.js';
import {
  PrimitiveValueType,
  NumberValueType,
  BooleanValueType,
  ArrayValueType,
  ObjectValueType,
  StringValueType,
} from './types.js';

type QueryParameterValue<V extends PrimitiveValueType> = V extends NumberValueType
  ? number
  : V extends StringValueType
  ? string
  : V extends BooleanValueType
  ? boolean
  : V extends ArrayValueType
  ? unknown[]
  : V extends ObjectValueType
  ? Record<string, unknown>
  : never;

export interface QueryParameterConfig<P extends Record<string, unknown>, K extends keyof P> {
  typeDef: PrimitiveValueType;
  defaultValue?: P[K];
}

export interface CreateQueryConfig<P extends Record<string, unknown>> {
  parameters: {
    [K in keyof P]: QueryParameterConfig<P, K>;
  };
}

type CreateQueryConfigParameters<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> =
  QueryResolverParams<C>['parameters'];

export interface QueryResolverParams<C extends CreateQueryConfig<CreateQueryConfigParameters<C>>> {
  parameters: {
    [K in keyof C['parameters']]: QueryParameterValue<C['parameters'][K]['typeDef']>;
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
