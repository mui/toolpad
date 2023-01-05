import { ToolpadComponents } from './types';
import { createProvidedContext } from './utils/react';

const [useComponents, ComponentsContextProvider] =
  createProvidedContext<ToolpadComponents>('Components');

export { useComponents, ComponentsContextProvider };
