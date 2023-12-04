import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab, Box, styled, Typography, Link } from '@mui/material';
import * as React from 'react';
import PageOptionsPanel from './PageOptionsPanel';
import ComponentEditor from './ComponentEditor';
import ThemeEditor from './ThemeEditor';
import { useAppState, useAppStateApi } from '../../AppState';
import { PageViewTab } from '../../../utils/domView';
import * as appDom from '../../../appDom';
import { PropControlsContextProvider, PropTypeControls } from '../../propertyControls';
import string from '../../propertyControls/string';
import boolean from '../../propertyControls/boolean';
import number from '../../propertyControls/number';
import select from '../../propertyControls/select';
import json from '../../propertyControls/json';
import event from '../../propertyControls/event';
import markdown from '../../propertyControls/Markdown';
import GridColumns from '../../propertyControls/GridColumns';
import ToggleButtons from '../../propertyControls/ToggleButtons';
import SelectOptions from '../../propertyControls/SelectOptions';
import ChartData from '../../propertyControls/ChartData';
import RowIdFieldSelect from '../../propertyControls/RowIdFieldSelect';
import HorizontalAlign from '../../propertyControls/HorizontalAlign';
import VerticalAlign from '../../propertyControls/VerticalAlign';
import NumberFormat from '../../propertyControls/NumberFormat';
import ColorScale from '../../propertyControls/ColorScale';
import DataProviderSelector from '../../propertyControls/DataProviderSelector';

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

const classes = {
  panel: 'Toolpad_Panel',
  themesDocsLink: 'Toolpad_ThemesDocsLink',
};

const ComponentPanelRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  [`& .${classes.panel}`]: {
    flex: 1,
    padding: theme.spacing(2),
    overflow: 'auto',
  },
  [`& .${classes.themesDocsLink}`]: {
    marginBottom: theme.spacing(1),
  },
}));

export interface ComponentPanelProps {
  className?: string;
}

export default function ComponentPanel({ className }: ComponentPanelProps) {
  const { dom, currentView } = useAppState();
  const appStateApi = useAppStateApi();

  const currentTab = currentView.kind === 'page' ? currentView.tab : null;

  const selectedNodeId = currentView.kind === 'page' ? currentView.selectedNodeId : null;
  const selectedNode = selectedNodeId ? appDom.getMaybeNode(dom, selectedNodeId) : null;

  const handleChange = (_: React.SyntheticEvent, newValue: PageViewTab) => {
    appStateApi.setTab(newValue);
  };

  return (
    <PropControlsContextProvider value={PROP_TYPE_CONTROLS}>
      <ComponentPanelRoot className={className}>
        <TabContext value={currentTab || 'page'}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="Component options">
              <Tab label="Page" value="page" />
              <Tab label="Component" value="component" disabled={!selectedNode} />
              <Tab label="Theme" value="theme" />
            </TabList>
          </Box>
          <TabPanel value="page" className={classes.panel}>
            <PageOptionsPanel />
          </TabPanel>
          <TabPanel value="component" className={classes.panel}>
            {selectedNode && appDom.isElement(selectedNode) ? (
              <ComponentEditor node={selectedNode} />
            ) : (
              <Typography variant="body1">No component selected.</Typography>
            )}
          </TabPanel>
          <TabPanel value="theme" className={classes.panel}>
            <Typography className={classes.themesDocsLink} variant="body2">
              Customize the app with a Material UI theme. Read more about theming in the{' '}
              <Link href="https://mui.com/toolpad/concepts/theming/" target="_blank" rel="noopener">
                docs
              </Link>
              .
            </Typography>
            <ThemeEditor />
          </TabPanel>
        </TabContext>
      </ComponentPanelRoot>
    </PropControlsContextProvider>
  );
}
