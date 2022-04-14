import { VersionOrPreview } from '../../types';
import { createProvidedContext } from '../../utils/react';

export interface AppEditorContext {
  id: string;
  version: VersionOrPreview;
}

const [useAppEditorContext, AppEditorContextprovider] =
  createProvidedContext<AppEditorContext>('App');
export { useAppEditorContext, AppEditorContextprovider };
