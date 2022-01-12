import { styled } from '@mui/system';
import * as React from 'react';
import { NodeId } from '../../types';
import { useEditorApi, useEditorState } from './EditorProvider';
import HierarchyExplorer from './HierarchyExplorer';

const PagePanelRoot = styled('div')({});

export interface ComponentPanelProps {
  className?: string;
}

export default function PagePanel({ className }: ComponentPanelProps) {
  const state = useEditorState();
  const api = useEditorApi();

  const handleSelect = (nodeId?: NodeId | null) => {
    if (nodeId) {
      api.select(nodeId);
    }
  };

  return (
    <PagePanelRoot className={className}>
      <HierarchyExplorer onSelect={handleSelect} selection={state.selection} />
    </PagePanelRoot>
  );
}
