import * as React from 'react';
import { styled } from '@mui/system';
import { useParams } from 'react-router-dom';
import RenderPanel from './RenderPanel';
import ComponentPanel from './ComponentPanel';
import BindingEditor from './BindingEditor';
import { PageEditorProvider } from './PageEditorProvider';
import { NodeId } from '../../../types';

const classes = {
  content: 'StudioContent',
  componentPanel: 'StudioComponentPanel',
  renderPanel: 'StudioRenderPanel',
  pagePanel: 'StudioPagePanel',
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
  const { pageNodeId } = useParams();
  return (
    <PageEditorProvider key={pageNodeId} nodeId={pageNodeId as NodeId}>
      <PageFileEditorRoot className={className}>
        <RenderPanel className={classes.renderPanel} />
        <ComponentPanel className={classes.componentPanel} />
        <BindingEditor />
      </PageFileEditorRoot>
    </PageEditorProvider>
  );
}
