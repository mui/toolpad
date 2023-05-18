import { TOOLPAD_FUNCTION } from './constants.js';
import { InferParameterType, PrimitiveValueType, PropValueType } from './types.js';

/**
 * The runtime configuration for a Toolpad function. Describes the parameters it accepts and their
 * corresponding types.
 */
export interface CreateFunctionConfig<P> {
  parameters: {
    [K in keyof P]: PrimitiveValueType;
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
> {
  (params: FunctionResolverParams<C>): Promise<unknown>;
}

export interface ToolpadFunction<C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>>
  extends FunctionResolver<C> {
  [TOOLPAD_FUNCTION]: C;
}

type MaybeLegacyParametersDefinition = PropValueType & {
  typeDef?: PropValueType;
  defaultValue?: any;
};

/**
 * Use this to define a function that will load the data for a Toolpad query.
 * You can define parameters for the function in the configuration object.
 * These parameters will be available in the Toolpad editor when creating a query and can be bound to page state.
 * The return value of this function will appear as state on the page and can be bound to.
 * @param resolver The function that will load the data for the query.
 * @param config The configuration for the function.
 */
export function createFunction<C extends CreateFunctionConfig<CreateFunctionConfigParameters<C>>>(
  resolver: FunctionResolver<C>,
  config?: C,
) {
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
