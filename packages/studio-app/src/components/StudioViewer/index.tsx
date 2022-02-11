import * as React from 'react';
import { styled } from '@mui/system';
import PageView from '../PageView';
import { NodeId } from '../../types';
import DomProvider, { useDomLoader } from '../DomLoader';

const ViewerRoot = styled(PageView)({
  display: 'block',
  height: '100vh',
});

export interface ViewerProps {
  pageNodeId: NodeId;
}

function ViewerContent({ pageNodeId }: ViewerProps) {
  const domLoader = useDomLoader();
  return domLoader.dom ? <ViewerRoot dom={domLoader.dom} pageNodeId={pageNodeId} /> : null;
}

export default function StudioViewer({ pageNodeId }: ViewerProps) {
  return (
    <DomProvider>
      <ViewerContent pageNodeId={pageNodeId} />
    </DomProvider>
  );
}
