import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab, Box, styled } from '@mui/material';
import * as React from 'react';
import ComponentEditor from './ComponentEditor';
import ThemeEditor from './ThemeEditor';
import { ComponentPanelTab, usePageEditorApi, usePageEditorState } from './PageEditorProvider';

const classes = {
  panel: 'Toolpad_Panel',
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
}));

export interface ComponentPanelProps {
  className?: string;
}

export default function ComponentPanel({ className }: ComponentPanelProps) {
  const state = usePageEditorState();
  const api = usePageEditorApi();

  const handleChange = (event: React.SyntheticEvent, newValue: ComponentPanelTab) =>
    api.setComponentPanelTab(newValue);

  return (
    <ComponentPanelRoot className={className}>
      <TabContext value={state.componentPanelTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Component" value="component" />
            <Tab label="Theme" value="theme" />
          </TabList>
        </Box>
        <TabPanel value="component" className={classes.panel}>
          <ComponentEditor />
        </TabPanel>
        <TabPanel value="theme" className={classes.panel}>
          <ThemeEditor />
        </TabPanel>
      </TabContext>
    </ComponentPanelRoot>
  );
}
