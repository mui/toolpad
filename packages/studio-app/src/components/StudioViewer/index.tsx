import React from 'react';
import { styled } from '@mui/system';
import PageView from '../PageView';
import { NodeId } from '../../types';
import DomProvider, { useDomState } from '../DomProvider';

const ViewerRoot = styled(PageView)({
  display: 'block',
  height: '100vh',
});

export interface ViewerProps {
  pageNodeId: NodeId;
}

function ViewerContent({ pageNodeId }: ViewerProps) {
  const domState = useDomState();
  return domState.dom ? <ViewerRoot dom={domState.dom} pageNodeId={pageNodeId} /> : null;
}

export default function StudioViewer({ pageNodeId }: ViewerProps) {
  return (
    <DomProvider>
      <ViewerContent pageNodeId={pageNodeId} />
    </DomProvider>
  );
}
