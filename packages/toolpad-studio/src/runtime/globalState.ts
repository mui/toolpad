import { ToolpadComponents } from '@toolpad/studio-runtime';
import { createGlobalState } from '@toolpad/utils/react';
import { type PageComponents } from './ToolpadApp';

export const componentsStore = createGlobalState<ToolpadComponents>({});
export const pageComponentsStore = createGlobalState<PageComponents>({});
