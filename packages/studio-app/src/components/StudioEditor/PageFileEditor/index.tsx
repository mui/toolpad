import * as React from 'react';
import { styled } from '@mui/system';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import { PageEditorProvider } from './PageEditorProvider';
import { NodeId } from '../../../types';
import { useDom } from '../../DomLoader';
import * as studioDom from '../../../studioDom';
import ComponentCatalog from './ComponentCatalog';

const classes = {
  componentPanel: 'StudioComponentPanel',
  renderPanel: 'StudioRenderPanel',
};

const PageFileEditorRoot = styled('div')(({ theme }) => ({
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

interface PageFileEditorProps {
  className?: string;
}

export default function PageFileEditor({ className }: PageFileEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const pageNode = studioDom.getNode2(dom, nodeId as NodeId, 'page');
  return pageNode ? (
    <PageEditorProvider key={nodeId} nodeId={nodeId as NodeId}>
      <PageFileEditorRoot className={className}>
        <ComponentCatalog />
        <RenderPanel className={classes.renderPanel} />
        <ComponentPanel className={classes.componentPanel} />
      </PageFileEditorRoot>
    </PageEditorProvider>
  ) : (
    <Typography sx={{ p: 4 }}>Non-existing Page &quot;{nodeId}&quot;</Typography>
  );
}
