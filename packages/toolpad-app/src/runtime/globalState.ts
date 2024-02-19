import { ToolpadComponents } from '@mui/toolpad-core';
import { createGlobalState } from '@mui/toolpad-utils/react';
import { type PageComponents } from './ToolpadApp';

export const componentsStore = createGlobalState<ToolpadComponents>({});
export const pageComponentsStore = createGlobalState<PageComponents>({});
