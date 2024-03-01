import { ToolpadComponents } from '@mui/toolpad-studio-runtime';
import { createGlobalState } from '@mui/toolpad-utils/react';
import { type PageComponents } from './ToolpadApp';

export const componentsStore = createGlobalState<ToolpadComponents>({});
export const pageComponentsStore = createGlobalState<PageComponents>({});
