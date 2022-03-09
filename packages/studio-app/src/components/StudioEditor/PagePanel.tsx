import { styled } from '@mui/system';
import * as React from 'react';
import HierarchyExplorer from './HierarchyExplorer';

const PagePanelRoot = styled('div')({
  display: 'flex',
});

export interface ComponentPanelProps {
  appId: string;
  className?: string;
}

export default function PagePanel({ appId, className }: ComponentPanelProps) {
  return (
    <PagePanelRoot className={className}>
      <HierarchyExplorer appId={appId} />
    </PagePanelRoot>
  );
}
