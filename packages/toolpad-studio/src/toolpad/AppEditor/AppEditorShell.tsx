import { Box } from '@mui/material';

import * as React from 'react';
import PagePanel from './PagePanel';

import { PropControlsContextProvider, PropTypeControls } from '../propertyControls';

import string from '../propertyControls/string';
import boolean from '../propertyControls/boolean';
import number from '../propertyControls/number';
import select from '../propertyControls/select';
import json from '../propertyControls/json';
import event from '../propertyControls/event';
import markdown from '../propertyControls/Markdown';
import GridColumns from '../propertyControls/GridColumns';
import ToggleButtons from '../propertyControls/ToggleButtons';
import SelectOptions from '../propertyControls/SelectOptions';
import ChartData from '../propertyControls/ChartData';
import RowIdFieldSelect from '../propertyControls/RowIdFieldSelect';
import HorizontalAlign from '../propertyControls/HorizontalAlign';
import VerticalAlign from '../propertyControls/VerticalAlign';
import NumberFormat from '../propertyControls/NumberFormat';
import ColorScale from '../propertyControls/ColorScale';
import DataProviderSelector from '../propertyControls/DataProviderSelector';

export const PROP_TYPE_CONTROLS: PropTypeControls = {
  string,
  boolean,
  number,
  select,
  json,
  markdown,
  event,
  GridColumns,
  ToggleButtons,
  SelectOptions,
  ChartData,
  RowIdFieldSelect,
  HorizontalAlign,
  VerticalAlign,
  NumberFormat,
  ColorScale,
  DataProviderSelector,
};
export interface ToolpadShellProps {
  children: React.ReactNode;
}

export default function AppEditorShell({ children }: ToolpadShellProps) {
  return (
    <PropControlsContextProvider value={PROP_TYPE_CONTROLS}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <PagePanel
          sx={{
            width: 250,
            borderRight: 1,
            borderColor: 'divider',
          }}
        />
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Box>
    </PropControlsContextProvider>
  );
}
