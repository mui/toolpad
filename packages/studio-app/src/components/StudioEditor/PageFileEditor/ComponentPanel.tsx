import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import { Box, styled } from '@mui/system';
import * as React from 'react';
import { ComponentPanelTab } from '../../../editorState';
import ComponentCatalog from '../ComponentCatalog';
import ComponentEditor from '../ComponentEditor';
import { useEditorApi, usePageEditorState } from '../EditorProvider';

const classes = {
  panel: 'StudioPanel',
};

const ComponentPanelRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  [`& .${classes.panel}`]: {
    flex: 1,
    overflow: 'auto',
  },
});

export interface ComponentPanelProps {
  className?: string;
}

export default function ComponentPanel({ className }: ComponentPanelProps) {
  const state = usePageEditorState();
  const api = useEditorApi();

  const handleChange = (event: React.SyntheticEvent, newValue: ComponentPanelTab) =>
    api.setComponentPanelTab(newValue);

  return (
    <ComponentPanelRoot className={className}>
      <TabContext value={state.componentPanelTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Catalog" value="catalog" />
            <Tab label="Component" value="component" />
          </TabList>
        </Box>
        <TabPanel value="catalog" className={classes.panel}>
          <ComponentCatalog />
        </TabPanel>
        <TabPanel value="component" className={classes.panel}>
          <ComponentEditor />
        </TabPanel>
      </TabContext>
    </ComponentPanelRoot>
  );
}
