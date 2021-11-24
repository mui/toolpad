import * as React from 'react';
import { styled } from '@mui/material';
import { NodeId, StudioPage, NodeLayout } from '../../types';
import { getRelativeBoundingBox, rectContainsPoint } from '../../utils/geometry';
import PageContext from './PageContext';
import { DATA_PROP_NODE_ID } from './contants';
import RenderedNode from './RenderedNode';
import RenderNodeContext from './RenderNodeContext';

const PageViewRoot = styled('div')({});

export function getNodeLayout(viewElm: HTMLElement, elm: HTMLElement): NodeLayout | null {
  const nodeId = (elm.getAttribute(DATA_PROP_NODE_ID) as NodeId | undefined) || null;
  if (nodeId) {
    return {
      nodeId,
      rect: getRelativeBoundingBox(viewElm, elm),
      slots: [],
    };
  }
  return null;
}

export function getViewCoordinates(
  viewElm: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = viewElm.getBoundingClientRect();
  if (rectContainsPoint(rect, clientX, clientY)) {
    return { x: clientX - rect.x, y: clientY - rect.y };
  }
  return null;
}

export interface PageViewProps {
  className?: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
  page: StudioPage;
}

const renderNode = (nodeId: NodeId) => <RenderedNode key={nodeId} nodeId={nodeId} />;

export default React.forwardRef(function PageView(
  { className, page, onAfterRender }: PageViewProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  React.useEffect(() => {
    onAfterRender?.();
  }, [onAfterRender]);
  return (
    <PageViewRoot ref={ref} className={className}>
      <RenderNodeContext.Provider value={renderNode}>
        <PageContext.Provider value={page}>{renderNode(page.root)}</PageContext.Provider>
      </RenderNodeContext.Provider>
    </PageViewRoot>
  );
});
