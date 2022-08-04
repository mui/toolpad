import * as React from 'react';
import clsx from 'clsx';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, styled } from '@mui/material';
import * as appDom from '../../../appDom';
import {
  absolutePositionCss,
  Rectangle,
  RectangleEdge,
  RECTANGLE_EDGE_BOTTOM,
  RECTANGLE_EDGE_LEFT,
  RECTANGLE_EDGE_RIGHT,
} from '../../../utils/geometry';
import { useDom } from '../../DomLoader';
import { useToolpadComponent } from '../toolpadComponents';
import { getElementNodeComponentId } from '../../../toolpadComponents';

const nodeHudClasses = {
  allowNodeInteraction: 'NodeHud_AllowNodeInteraction',
  selected: 'NodeHud_Selected',
  selectionHint: 'NodeHud_SelectionHint',
};

const NodeHudWrapper = styled('div')({
  // capture mouse events
  pointerEvents: 'initial',
  position: 'absolute',
  outline: '1px dotted rgba(255,0,0,.2)',
  userSelect: 'none',
  [`.${nodeHudClasses.selected}`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    outline: '1px solid red',
  },
  [`.${nodeHudClasses.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    right: -1,
    background: 'red',
    color: 'white',
    fontSize: 11,
    padding: `0 0 0 8px`,
    // TODO: figure out positioning of this selectionhint, perhaps it should
    //   - prefer top right, above the component
    //   - if that appears out of bound of the editor, show it bottom or left
    zIndex: 1,
    transform: `translate(0, -100%)`,
  },
  [`&.${nodeHudClasses.allowNodeInteraction}`]: {
    // block pointer-events so we can interact with the selection
    pointerEvents: 'none',
  },
});

const DraggableEdge = styled('div', {
  shouldForwardProp: (prop) => prop !== 'edge',
})<{
  edge: RectangleEdge;
}>(({ edge }) => {
  let dynamicStyles = {};
  if (edge === RECTANGLE_EDGE_RIGHT) {
    dynamicStyles = {
      cursor: 'ew-resize',
      top: 0,
      right: -2,
      height: '100%',
      width: 12,
    };
  }
  if (edge === RECTANGLE_EDGE_LEFT) {
    dynamicStyles = {
      cursor: 'ew-resize',
      top: 0,
      left: -2,
      height: '100%',
      width: 12,
    };
  }
  if (edge === RECTANGLE_EDGE_BOTTOM) {
    dynamicStyles = {
      cursor: 'ns-resize',
      bottom: -2,
      height: 12,
      left: 0,
      width: '100%',
    };
  }

  return {
    ...dynamicStyles,
    position: 'absolute',
    pointerEvents: 'initial',
    zIndex: 1,
  };
});

const ResizePreview = styled('div')({
  backgroundColor: '#44EB2D',
  opacity: 0.5,
});

interface NodeHudProps {
  node: appDom.ElementNode | appDom.PageNode;
  rect: Rectangle;
  selected?: boolean;
  allowInteraction?: boolean;
  onNodeDragStart?: React.DragEventHandler<HTMLElement>;
  draggableEdges?: RectangleEdge[];
  onEdgeDragStart?: (
    node: appDom.ElementNode,
    edge: RectangleEdge,
  ) => React.MouseEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLElement>;
  isResizing?: boolean;
  resizePreviewElementRef: React.MutableRefObject<HTMLDivElement | null>;
}

export default function NodeHud({
  node,
  selected,
  allowInteraction,
  rect,
  onNodeDragStart,
  draggableEdges = [],
  onEdgeDragStart,
  onDelete,
  isResizing = false,
  resizePreviewElementRef,
}: NodeHudProps) {
  const dom = useDom();

  const componentId = appDom.isElement(node) ? getElementNodeComponentId(node) : '';
  const component = useToolpadComponent(dom, componentId);

  const handleDelete = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      if (onDelete) {
        onDelete(event);
      }
    },
    [onDelete],
  );

  return (
    <NodeHudWrapper
      data-node-id={node.id}
      style={absolutePositionCss(rect)}
      className={clsx({
        [nodeHudClasses.allowNodeInteraction]: allowInteraction,
      })}
    >
      {selected ? (
        <React.Fragment>
          <span className={nodeHudClasses.selected} />
          <div draggable className={nodeHudClasses.selectionHint} onDragStart={onNodeDragStart}>
            {component?.displayName || '<unknown>'}
            <DragIndicatorIcon color="inherit" />
            <IconButton aria-label="Remove element" color="inherit" onMouseUp={handleDelete}>
              <DeleteIcon color="inherit" />
            </IconButton>
          </div>
        </React.Fragment>
      ) : null}
      {onEdgeDragStart
        ? draggableEdges.map((edge) => (
            <DraggableEdge
              key={`${node.id}-edge-${edge}`}
              edge={edge}
              onMouseDown={onEdgeDragStart(node as appDom.ElementNode, edge)}
            />
          ))
        : null}
      {isResizing ? (
        <ResizePreview ref={resizePreviewElementRef} style={absolutePositionCss(rect)} />
      ) : null}
    </NodeHudWrapper>
  );
}
