import { TOOLPAD_QUERY } from './constants.js';
import { PropValueType } from './types.js';

export interface QueryResolverParams<P> {
  parameters: P;
}

export interface QueryResolver<P> {
  (params: QueryResolverParams<P>): Promise<any>;
}

export interface QueryParameterConfig<P, K extends keyof P> {
  typeDef: PropValueType;
  defaultValue?: P[K];
}

export interface CreateQueryConfig<P> {
  parameters: {
    [K in keyof P]: QueryParameterConfig<P, K>;
  };
}

export interface ToolpadQuery<P> extends QueryResolver<P> {
  [TOOLPAD_QUERY]: CreateQueryConfig<P>;
}

export default function createQuery<P>(resolver: QueryResolver<P>, config?: CreateQueryConfig<P>) {
  return Object.assign(resolver, {
    [TOOLPAD_QUERY]: config || { parameters: {} },
  });
}
