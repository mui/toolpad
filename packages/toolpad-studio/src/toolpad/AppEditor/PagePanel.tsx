import * as React from 'react';
import { styled, SxProps, Box, Divider, Typography } from '@mui/material';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import PagesExplorer from './PagesExplorer';
import PageHierarchyExplorer from './HierarchyExplorer';
import { useAppState } from '../AppState';
import AppOptions from '../AppOptions';
import { QueriesExplorer, ActionsExplorer } from './PageEditor/QueriesExplorer';
import { useProject } from '../../project';

const PAGE_PANEL_WIDTH = 250;

const PagePanelRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: PAGE_PANEL_WIDTH,
});

export interface ComponentPanelProps {
  className?: string;
  sx?: SxProps;
}

export default function PagePanel({ className, sx }: ComponentPanelProps) {
  const project = useProject();
  const { dom, currentView } = useAppState();

  const currentPageNode = currentView?.name ? appDom.getPageByName(dom, currentView.name) : null;

  return (
    <PagePanelRoot className={className} sx={sx}>
      <Box
        sx={{
          pl: 2,
          pr: 1,
          py: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography noWrap>{project.rootDir.split(/[/\\]/).pop()}</Typography>

        <AppOptions dom={dom} />
      </Box>
      <Divider />

      <PanelGroup autoSaveId="toolpad-page-panel" direction="vertical">
        <Panel id="pages-explorer" order={1} minSize={10} defaultSize={30}>
          <PagesExplorer />
        </Panel>
        {currentPageNode && !appDom.isCodePage(currentPageNode) ? (
          <React.Fragment>
            <PanelResizeHandle />
            <Panel id="hierarchy-explorer" order={2} minSize={25} maxSize={90}>
              <PageHierarchyExplorer />
            </Panel>
            <PanelResizeHandle />
            <Panel id="queries-explorer" order={3} minSize={10} defaultSize={25} maxSize={90}>
              <QueriesExplorer />
            </Panel>
            <PanelResizeHandle />
            <Panel id="actions-explorer" order={4} minSize={10} defaultSize={25} maxSize={90}>
              <ActionsExplorer />
            </Panel>
          </React.Fragment>
        ) : null}
      </PanelGroup>
    </PagePanelRoot>
  );
}
