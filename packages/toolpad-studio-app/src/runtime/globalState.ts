import { ToolpadComponents } from '@mui/toolpad-studio-core';
import { createGlobalState } from '@mui/toolpad-studio-utils/react';
import { type PageComponents } from './ToolpadApp';

export const componentsStore = createGlobalState<ToolpadComponents>({});
export const pageComponentsStore = createGlobalState<PageComponents>({});
