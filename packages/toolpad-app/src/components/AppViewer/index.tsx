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
  appId: string;
  pageNodeId: NodeId;
}

function ViewerContent({ appId, pageNodeId }: ViewerProps) {
  const domLoader = useDomLoader();
  return domLoader.dom ? (
    <ViewerRoot appId={appId} dom={domLoader.dom} pageNodeId={pageNodeId} />
  ) : null;
}

export default function AppViewer({ appId, pageNodeId }: ViewerProps) {
  return (
    <DomProvider appId={appId}>
      <ViewerContent appId={appId} pageNodeId={pageNodeId} />
    </DomProvider>
  );
}
