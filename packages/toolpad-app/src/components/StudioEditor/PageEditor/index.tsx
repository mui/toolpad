import * as React from 'react';
import { styled } from '@mui/system';
import { useParams } from 'react-router-dom';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { PageEditorProvider } from './PageEditorProvider';
import { NodeId } from '../../../types';
import { useDom } from '../../DomLoader';
import * as appDom from '../../../appDom';
import ComponentCatalog from './ComponentCatalog';
import NotFoundEditor from '../NotFoundEditor';

const classes = {
  componentPanel: 'StudioComponentPanel',
  renderPanel: 'StudioRenderPanel',
};

const PageEditorRoot = styled('div')(({ theme }) => ({
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
  className?: string;
}

export default function PageEditor({ appId, className }: PageEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const pageNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'page');
  return pageNode ? (
    <PageEditorProvider key={nodeId} appId={appId} nodeId={nodeId as NodeId}>
      <PageEditorRoot className={className}>
        <ComponentCatalog />
        <RenderPanel className={classes.renderPanel} />
        <ComponentPanel className={classes.componentPanel} />
      </PageEditorRoot>
    </PageEditorProvider>
  ) : (
    <NotFoundEditor className={className} message={`Non-existing Page "${nodeId}"`} />
  );
}
