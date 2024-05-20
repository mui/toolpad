import {
  ArgTypeDefinition,
  ComponentConfig,
  createComponent,
  ToolpadComponent,
} from '@toolpad/studio-runtime';

export type BuiltinArgTypeDefinition<P extends object, K extends keyof P> = ArgTypeDefinition<
  P,
  K
> & {
  helperText: string;
};

export type BuiltinArgTypeDefinitions<P extends object> = {
  [K in keyof P & string]?: BuiltinArgTypeDefinition<P, K> | undefined;
};

export type BuiltinComponentConfig<P extends object> = ComponentConfig<P> & {
  helperText: string;
  argTypes: BuiltinArgTypeDefinitions<P>;
};

export default function createBuiltin<P extends object>(
  Component: React.ComponentType<P>,
  config: BuiltinComponentConfig<P>,
): ToolpadComponent<P> {
  return createComponent(Component, config);
}
