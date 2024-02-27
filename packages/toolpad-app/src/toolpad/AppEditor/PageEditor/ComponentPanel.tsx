import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab, Box, styled, Typography, Link } from '@mui/material';
import * as React from 'react';
import * as appDom from '@mui/toolpad-core/appDom';
import PageOptionsPanel from './PageOptionsPanel';
import ComponentEditor from './ComponentEditor';
import ThemeEditor from './ThemeEditor';
import { useAppState, useAppStateApi } from '../../AppState';
import { PageViewTab } from '../../../utils/domView';

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

  const currentTab = currentView.kind === 'page' ? currentView.pageViewTab : null;

  const selectedNodeId = currentView.kind === 'page' ? currentView.selectedNodeId : null;
  const selectedNode = selectedNodeId ? appDom.getMaybeNode(dom, selectedNodeId) : null;

  const handleChange = (_: React.SyntheticEvent, newValue: PageViewTab) => {
    appStateApi.setPageViewTab(newValue);
  };

  return (
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
  );
}
