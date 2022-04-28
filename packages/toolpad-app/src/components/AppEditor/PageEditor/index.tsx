import * as React from 'react';
import { styled } from '@mui/material';
import { useParams } from 'react-router-dom';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { PageEditorProvider } from './PageEditorProvider';
import { NodeId } from '../../../types';
import { useDom } from '../../DomLoader';
import * as appDom from '../../../appDom';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';
import AppEditorShell from '../AppEditorShell';

const classes = {
  componentPanel: 'Toolpad_ComponentPanel',
  renderPanel: 'Toolpad_RenderPanel',
};

const PageEditorRoot = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
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
}

export default function PageEditor({ appId }: PageEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const pageNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'page');
  return (
    <AppEditorShell appId={appId} activeNodeId={pageNode?.id}>
      {pageNode ? (
        <PageEditorProvider key={nodeId} appId={appId} nodeId={nodeId as NodeId}>
          <PageEditorRoot>
            <ComponentCatalog />
            <RenderPanel className={classes.renderPanel} />
            <ComponentPanel className={classes.componentPanel} />
          </PageEditorRoot>
        </PageEditorProvider>
      ) : (
        <NotFoundEditor message={`Non-existing Page "${nodeId}"`} />
      )}
    </AppEditorShell>
  );
}
