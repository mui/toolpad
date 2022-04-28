import { styled, SxProps } from '@mui/material';
import * as React from 'react';
import HierarchyExplorer from './HierarchyExplorer';

const PagePanelRoot = styled('div')({
  display: 'flex',
});

export interface ComponentPanelProps {
  appId: string;
  className?: string;
  sx?: SxProps;
}

export default function PagePanel({ appId, className, sx }: ComponentPanelProps) {
  return (
    <PagePanelRoot className={className} sx={sx}>
      <HierarchyExplorer appId={appId} />
    </PagePanelRoot>
  );
}
