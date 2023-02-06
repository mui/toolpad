import * as React from 'react';
import clsx from 'clsx';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { IconButton, styled, Tooltip } from '@mui/material';
import * as appDom from '../../../../appDom';
import {
  absolutePositionCss,
  Rectangle,
  RectangleEdge,
  RECTANGLE_EDGE_BOTTOM,
  RECTANGLE_EDGE_LEFT,
  RECTANGLE_EDGE_RIGHT,
} from '../../../../utils/geometry';
import { useDom } from '../../../DomLoader';
import { useToolpadComponent } from '../../toolpadComponents';
import { getElementNodeComponentId } from '../../../../toolpadComponents';
import { blue } from '../../../../theme';
import {
  DropZone,
  DROP_ZONE_BOTTOM,
  DROP_ZONE_LEFT,
  DROP_ZONE_RIGHT,
  DROP_ZONE_TOP,
} from '../PageEditorProvider';

const HUD_POSITION_TOP = 'top';
const HUD_POSITION_BOTTOM = 'bottom';

const HUD_HEIGHT = 30; // px

type HudPosition = typeof HUD_POSITION_TOP | typeof HUD_POSITION_BOTTOM;

function stopPropagationHandler(event: React.SyntheticEvent) {
  event.stopPropagation();
}

const nodeHudClasses = {
  allowNodeInteraction: 'NodeHud_AllowNodeInteraction',
  selected: 'NodeHud_Selected',
  selectionHint: 'NodeHud_SelectionHint',
  dropTriangleUp: 'NodeHud_DropTriangleUp',
  dropTriangleLeft: 'NodeHud_DropTriangleLeft',
  dropTriangleBottom: 'NodeHud_DropTriangleBottom',
  dropTriangleRight: 'NodeHud_DropTriangleRight',
};

const NodeHudWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hudPosition' && prop !== 'isOutlineVisible',
})<{
  hudPosition: HudPosition;
  isOutlineVisible: boolean;
}>(({ isOutlineVisible, hudPosition }) => ({
  // capture mouse events
  pointerEvents: 'initial',
  position: 'absolute',
  userSelect: 'none',
  zIndex: 2,
  outline: isOutlineVisible ? `1px dotted ${blue[500]}` : 'none',
  transition: 'outline 0.05s ease, opacity 0.5s ease',
  '&:hover': {
    outline: `2px dashed ${blue[500]}`,
  },
  [`.${nodeHudClasses.selected}`]: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    outline: `2px solid ${blue[500]}`,
    left: 0,
    top: 0,
    zIndex: 2,
  },
  [`.${nodeHudClasses.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    right: -1,
    background: blue[500],
    color: 'white',
    fontSize: 11,
    padding: `0 0 0 8px`,
    height: HUD_HEIGHT,
    zIndex: 1000,
    ...(hudPosition === HUD_POSITION_TOP
      ? { top: 0, transform: 'translate(0, -100%)' }
      : { bottom: 0, transform: 'translate(0, 100%)' }),
  },
  [`.${nodeHudClasses.dropTriangleLeft}`]: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    zIndex: 2,
    clipPath: 'polygon(50% 50%, 0 0, 0 100%)',
    background: blue[500],
    opacity: 0.1,
  },
  [`.${nodeHudClasses.dropTriangleRight}`]: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    zIndex: 2,
    clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)',
    background: blue[500],
    opacity: 0.1,
  },
  [`.${nodeHudClasses.dropTriangleBottom}`]: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    zIndex: 2,
    clipPath: 'polygon(50% 50%, 100% 100%, 0 100%)',
    background: blue[500],
    opacity: 0.1,
  },
  [`.${nodeHudClasses.dropTriangleUp}`]: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    zIndex: 2,
    clipPath: 'polygon(50% 50%, 0 0, 100% 0)',
    background: blue[500],
    opacity: 0.1,
  },
  [`&.${nodeHudClasses.allowNodeInteraction}`]: {
    // block pointer-events so we can interact with the selection
    pointerEvents: 'none',
  },
}));

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
  backgroundColor: blue[500],
  opacity: 0.2,
  zIndex: 3,
});

interface NodeHudProps {
  node: appDom.AppDomNode;
  rect: Rectangle;
  isSelected?: boolean;
  isInteractive?: boolean;
  onNodeDragStart?: React.DragEventHandler<HTMLElement>;
  draggableEdges?: RectangleEdge[];
  onEdgeDragStart?: (
    node: appDom.ElementNode,
    edge: RectangleEdge,
  ) => React.MouseEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLElement>;
  isResizing?: boolean;
  resizePreviewElementRef: React.MutableRefObject<HTMLDivElement | null>;
  onDuplicate?: (event: React.MouseEvent) => void;
  isOutlineVisible?: boolean;
  highlightedZone?: DropZone | null;
}

export default function NodeHud({
  node,
  rect,
  isSelected,
  isInteractive,
  onNodeDragStart,
  draggableEdges = [],
  onEdgeDragStart,
  onDelete,
  isResizing = false,
  resizePreviewElementRef,
  onDuplicate,
  isOutlineVisible = false,
  highlightedZone,
}: NodeHudProps) {
  const { dom } = useDom();

  const componentId = appDom.isElement(node) ? getElementNodeComponentId(node) : '';
  const component = useToolpadComponent(dom, componentId);

  const hudPosition = rect.y > HUD_HEIGHT ? HUD_POSITION_TOP : HUD_POSITION_BOTTOM;

  const iconSx = { opacity: 0.7 };

  return (
    <NodeHudWrapper
      data-node-id={node.id}
      style={absolutePositionCss(rect)}
      className={clsx({
        [nodeHudClasses.allowNodeInteraction]: isInteractive,
      })}
      hudPosition={hudPosition}
      isOutlineVisible={isOutlineVisible}
    >
      {isSelected ? (
        <React.Fragment>
          <span className={nodeHudClasses.selected} />
          <div
            draggable
            className={nodeHudClasses.selectionHint}
            onDragStart={onNodeDragStart}
            role="presentation"
            onClick={stopPropagationHandler}
            onMouseDown={stopPropagationHandler}
            onMouseUp={stopPropagationHandler}
          >
            {component?.displayName || '<unknown>'}
            <DragIndicatorIcon color="inherit" sx={iconSx} />
            <IconButton aria-label="Duplicate" color="inherit" onMouseUp={onDuplicate} sx={iconSx}>
              <Tooltip title="Duplicate" enterDelay={400}>
                <ContentCopy color="inherit" />
              </Tooltip>
            </IconButton>
            <IconButton aria-label="Remove" color="inherit" onMouseUp={onDelete} sx={iconSx}>
              <Tooltip title="Remove" enterDelay={400}>
                <DeleteIcon color="inherit" />
              </Tooltip>
            </IconButton>
          </div>
        </React.Fragment>
      ) : null}
      <React.Fragment>
        {highlightedZone === DROP_ZONE_TOP ? (
          <span className={nodeHudClasses.dropTriangleUp} />
        ) : null}
        {highlightedZone === DROP_ZONE_LEFT ? (
          <span className={nodeHudClasses.dropTriangleLeft} />
        ) : null}
        {highlightedZone === DROP_ZONE_BOTTOM ? (
          <span className={nodeHudClasses.dropTriangleBottom} />
        ) : null}
        {highlightedZone === DROP_ZONE_RIGHT ? (
          <span className={nodeHudClasses.dropTriangleRight} />
        ) : null}
      </React.Fragment>
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
