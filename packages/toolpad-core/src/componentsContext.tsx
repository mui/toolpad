import { ToolpadComponents } from './types.js';
import { createProvidedContext } from './utils/react.js';

const [useComponents, ComponentsContextProvider] =
  createProvidedContext<ToolpadComponents>('Components');

export { useComponents, ComponentsContextProvider };
