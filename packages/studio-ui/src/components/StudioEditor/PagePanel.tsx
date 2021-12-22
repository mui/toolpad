import { styled } from '@mui/system';
import * as React from 'react';
import HierarchyExplorer from './HierarchyExplorer';

const PagePanelRoot = styled('div')({});

export interface ComponentPanelProps {
  className?: string;
}

export default function PagePanel({ className }: ComponentPanelProps) {
  return (
    <PagePanelRoot className={className}>
      <HierarchyExplorer />
    </PagePanelRoot>
  );
}
