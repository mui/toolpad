import * as React from 'react';
import { styled, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { PageEditorProvider } from './PageEditorProvider';
import { NodeId } from '../../../types';
import { useDom } from '../../DomLoader';
import * as appDom from '../../../appDom';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';

const classes = {
  componentPanel: 'Toolpad_ComponentPanel',
  pageContentPanel: 'Toolpad_PageContentPanel',
  renderPanel: 'Toolpad_RenderPanel',
};

const PageEditorRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
  [`& .${classes.pageContentPanel}`]: {
    flex: 1,
  },
  [`& .${classes.renderPanel}`]: {
    flex: 1,
  },
  [`& .${classes.componentPanel}`]: {
    width: 300,
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));

interface PageEditorProps {
  appId: string;
  className?: string;
}

export default function PageEditor({ appId, className }: PageEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const pageNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'page');
  return pageNode ? (
    <PageEditorProvider key={nodeId} appId={appId} nodeId={nodeId as NodeId}>
      <PageEditorRoot className={className}>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <SplitPane
            split="horizontal"
            allowResize
            defaultSize="80%"
            paneStyle={{
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', flex: 1 }}>
              <ComponentCatalog />
              <RenderPanel className={classes.renderPanel} />
            </Box>
            <Box />
          </SplitPane>
        </Box>
        <ComponentPanel className={classes.componentPanel} />
      </PageEditorRoot>
    </PageEditorProvider>
  ) : (
    <NotFoundEditor className={className} message={`Non-existing Page "${nodeId}"`} />
  );
}
