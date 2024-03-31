import * as React from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { IconButton, styled, Tooltip } from '@mui/material';
import * as appDom from '@toolpad/studio-runtime/appDom';
import {
  absolutePositionCss,
  Rectangle,
  RectangleEdge,
  RECTANGLE_EDGE_BOTTOM,
  RECTANGLE_EDGE_LEFT,
  RECTANGLE_EDGE_RIGHT,
  RECTANGLE_EDGE_TOP,
} from '../../../../utils/geometry';

const HINT_POSITION_TOP = 'top';
const HINT_POSITION_BOTTOM = 'bottom';

const HUD_HEIGHT = 30; // px

type HintPosition = typeof HINT_POSITION_TOP | typeof HINT_POSITION_BOTTOM;

function stopPropagationHandler(event: React.SyntheticEvent) {
  event.stopPropagation();
}

const nodeHudClasses = {
  selected: 'NodeHud_Selected',
  hovered: 'NodeHud_Hovered',
  selectionHint: 'NodeHud_SelectionHint',
};

const NodeHudWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isOutlineVisible' && prop !== 'isHoverable',
})<{
  isOutlineVisible: boolean;
  isHoverable: boolean;
}>(({ isOutlineVisible, isHoverable, theme }) => {
  const defaultOutline = `1px dotted ${
    isOutlineVisible ? theme.palette.primary[500] : 'transparent'
  }`;

  return {
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    userSelect: 'none',
    outline: defaultOutline,
    zIndex: 80,
    [`&:hover, &.${nodeHudClasses.hovered}`]: {
      outline: `2px dashed ${isHoverable ? theme.palette.primary[500] : defaultOutline}`,
    },
    [`.${nodeHudClasses.selected}`]: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      outline: `2px solid ${theme.palette.primary[500]}`,
      left: 0,
      top: 0,
      zIndex: 80,
    },
  };
});

const SelectionHintWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hintPosition',
})<{
  hintPosition: HintPosition;
}>(({ hintPosition, theme }) => ({
  position: 'absolute',
  [`.${nodeHudClasses.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    right: -1,
    background: theme.palette.primary[500],
    color: 'white',
    fontSize: 11,
    padding: `0 0 0 8px`,
    height: HUD_HEIGHT,
    zIndex: 1000,
    ...(hintPosition === HINT_POSITION_TOP
      ? { top: 0, transform: 'translate(0, -100%)' }
      : {
          bottom: 0,
          transform: 'translate(0, 100%)',
        }),
  },
}));

const DraggableEdgeWrapper = styled('div')({
  userSelect: 'none',
  position: 'absolute',
  zIndex: 90,
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
      right: -10,
      height: '100%',
      width: 22,
    };
  }
  if (edge === RECTANGLE_EDGE_LEFT) {
    dynamicStyles = {
      cursor: 'ew-resize',
      top: 0,
      left: -10,
      height: '100%',
      width: 22,
    };
  }
  if (edge === RECTANGLE_EDGE_BOTTOM) {
    dynamicStyles = {
      cursor: 'ns-resize',
      bottom: -10,
      height: 22,
      left: 0,
      width: '100%',
    };
  }
  if (edge === RECTANGLE_EDGE_TOP) {
    dynamicStyles = {
      cursor: 'ns-resize',
      top: -10,
      height: 22,
      left: 0,
      width: '100%',
    };
  }

  return {
    ...dynamicStyles,
    position: 'absolute',
    pointerEvents: 'initial',
    zIndex: 90,
  };
});

const ResizePreview = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary[500],
  opacity: 0.2,
  zIndex: 90,
}));

interface NodeHudProps {
  node: appDom.AppDomNode;
  rect: Rectangle;
  selectedNodeRect: Rectangle | null;
  isSelected?: boolean;
  isInteractive?: boolean;
  onNodeDragStart?: React.DragEventHandler<HTMLElement>;
  draggableEdges?: RectangleEdge[];
  onEdgeDragStart?: (edge: RectangleEdge) => React.MouseEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLElement>;
  isResizing?: boolean;
  resizePreviewElementRef: React.MutableRefObject<HTMLDivElement | null>;
  onDuplicate?: (event: React.MouseEvent) => void;
  isOutlineVisible?: boolean;
  isHoverable?: boolean;
  isHovered?: boolean;
}

export default function NodeHud({
  node,
  rect,
  selectedNodeRect,
  isSelected,
  isInteractive = false,
  onNodeDragStart,
  draggableEdges = [],
  onEdgeDragStart,
  onDelete,
  isResizing = false,
  resizePreviewElementRef,
  onDuplicate,
  isOutlineVisible = false,
  isHoverable = true,
  isHovered = false,
}: NodeHudProps) {
  let hintPosition: HintPosition = HINT_POSITION_BOTTOM;
  if (rect.y > HUD_HEIGHT) {
    hintPosition = HINT_POSITION_TOP;
  }

  const interactiveNodeClipPath = React.useMemo(
    () =>
      isInteractive && selectedNodeRect
        ? `
            polygon(
              -100% -100%, 
              200% -100%,
              200% 200%,
              -100% 200%,
              -100% ${selectedNodeRect.y - rect.y}px,
              ${selectedNodeRect.x - rect.x}px ${selectedNodeRect.y - rect.y}px, 
              ${selectedNodeRect.x - rect.x}px 
              ${selectedNodeRect.y + selectedNodeRect.height - rect.y}px,
              ${selectedNodeRect.x + selectedNodeRect.width - rect.x}px
              ${selectedNodeRect.y + selectedNodeRect.height - rect.y}px, 
              ${selectedNodeRect.x + selectedNodeRect.width - rect.x}px 
              ${selectedNodeRect.y - rect.y}px,
              -100% ${selectedNodeRect.y - rect.y}px
          )`
        : '',
    [isInteractive, rect, selectedNodeRect],
  );

  return (
    <React.Fragment>
      <NodeHudWrapper
        data-node-id={node.id}
        style={{
          ...absolutePositionCss(rect),
          ...(interactiveNodeClipPath
            ? {
                clipPath: interactiveNodeClipPath,
              }
            : {}),
        }}
        className={isHovered ? nodeHudClasses.hovered : ''}
        isOutlineVisible={isOutlineVisible}
        isHoverable={isHoverable}
      >
        {isSelected ? <span className={nodeHudClasses.selected} /> : null}
        {isResizing ? (
          <ResizePreview ref={resizePreviewElementRef} style={absolutePositionCss(rect)} />
        ) : null}
      </NodeHudWrapper>
      {isSelected ? (
        <SelectionHintWrapper
          style={absolutePositionCss(rect)}
          hintPosition={hintPosition}
          data-testid="node-hud-selection"
        >
          <div
            draggable
            data-testid="node-hud-tag"
            className={nodeHudClasses.selectionHint}
            onDragStart={onNodeDragStart}
            role="presentation"
            onClick={stopPropagationHandler}
            onMouseDown={stopPropagationHandler}
            onMouseUp={stopPropagationHandler}
          >
            {node.name}
            <DragIndicatorIcon color="inherit" />
            <IconButton aria-label="Duplicate" color="inherit" onMouseUp={onDuplicate}>
              <Tooltip title="Duplicate" enterDelay={400}>
                <ContentCopy color="inherit" />
              </Tooltip>
            </IconButton>
            <IconButton aria-label="Remove" color="inherit" onMouseUp={onDelete}>
              <Tooltip title="Remove" enterDelay={400}>
                <DeleteIcon color="inherit" />
              </Tooltip>
            </IconButton>
          </div>
        </SelectionHintWrapper>
      ) : null}
      {onEdgeDragStart ? (
        <DraggableEdgeWrapper style={absolutePositionCss(rect)}>
          {draggableEdges.map((edge) => (
            <DraggableEdge
              key={`${node.id}-edge-${edge}`}
              edge={edge}
              onMouseDown={onEdgeDragStart(edge)}
            />
          ))}
        </DraggableEdgeWrapper>
      ) : null}
    </React.Fragment>
  );
}
