import { TOOLPAD_FUNCTION } from './constants.js';
import { PrimitiveValueType } from './types.js';

interface ParameterTypeLookup {
  number: number;
  string: string;
  boolean: boolean;
  array: unknown[];
  object: Record<string, unknown>;
}

export interface FunctionParameterConfig<P, K extends keyof P> {
  typeDef: PrimitiveValueType;
  defaultValue?: P[K];
}

export interface CreateFunctionConfig<P> {
  parameters: {
    [K in keyof P]: FunctionParameterConfig<P, K>;
  };
}

type CreateFunctionConfigParameters<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
> = FunctionResolverParams<C>['parameters'];

export interface FunctionResolverParams<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
> {
  parameters: {
    [K in keyof C['parameters']]: ParameterTypeLookup[C['parameters'][K]['typeDef']['type']];
  };
}

export interface FunctionResolver<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
> {
  (params: FunctionResolverParams<C>): Promise<unknown>;
}

export interface ToolpadFunction<C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>>
  extends FunctionResolver<C> {
  [TOOLPAD_FUNCTION]: C;
}

export default function createFunction<
  C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>,
>(resolver: FunctionResolver<C>, config?: C) {
  return Object.assign(resolver, {
    [TOOLPAD_FUNCTION]: config || { parameters: {} },
  });
}
