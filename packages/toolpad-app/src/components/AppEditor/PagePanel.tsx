import { styled, SxProps } from '@mui/material';
import * as React from 'react';
import { NodeId } from '../../types';
import HierarchyExplorer from './HierarchyExplorer';

const PagePanelRoot = styled('div')({
  display: 'flex',
});

export interface ComponentPanelProps {
  appId: string;
  /**
   * NodeId of the currently selected object. To be used to display active status in the hierarchy
   */
  activeNodeId?: NodeId;
  className?: string;
  sx?: SxProps;
}

export default function PagePanel({ appId, activeNodeId, className, sx }: ComponentPanelProps) {
  return (
    <PagePanelRoot className={className} sx={sx}>
      <HierarchyExplorer activeNodeId={activeNodeId} appId={appId} />
    </PagePanelRoot>
  );
}
