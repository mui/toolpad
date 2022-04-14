import { createProvidedContext } from '../../utils/react';

export interface AppEditorContext {
  id: string;
}

const [useAppEditorContext, AppEditorContextprovider] =
  createProvidedContext<AppEditorContext>('App');
export { useAppEditorContext, AppEditorContextprovider };
