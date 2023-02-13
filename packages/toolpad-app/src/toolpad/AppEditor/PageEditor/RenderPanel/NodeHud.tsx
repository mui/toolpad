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
  RECTANGLE_EDGE_TOP,
} from '../../../../utils/geometry';
import { useDom, useDomApi } from '../../../DomLoader';
import { useToolpadComponent } from '../../toolpadComponents';
import { getElementNodeComponentId } from '../../../../toolpadComponents';

const HINT_POSITION_TOP = 'top';
const HINT_POSITION_BOTTOM = 'bottom';

const HUD_HEIGHT = 30; // px

type HintPosition = typeof HINT_POSITION_TOP | typeof HINT_POSITION_BOTTOM;

function stopPropagationHandler(event: React.SyntheticEvent) {
  event.stopPropagation();
}

const nodeHudClasses = {
  allowNodeInteraction: 'NodeHud_AllowNodeInteraction',
  selected: 'NodeHud_Selected',
  selectionHint: 'NodeHud_SelectionHint',
};

const NodeHudWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isOutlineVisible' && prop !== 'isHoverable',
})<{
  isOutlineVisible: boolean;
  isHoverable: boolean;
}>(({ isOutlineVisible, isHoverable, theme }) => ({
  // capture mouse events
  pointerEvents: 'initial',
  position: 'absolute',
  userSelect: 'none',
  outline: `1px dotted ${isOutlineVisible ? theme.palette.primary[500] : 'transparent'}`,
  zIndex: 2,
  '&:hover': {
    outline: `2px dashed ${isHoverable ? 'transparent' : theme.palette.primary[500]}`,
  },
  [`.${nodeHudClasses.selected}`]: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    outline: `2px solid ${theme.palette.primary[500]}`,
    left: 0,
    top: 0,
    zIndex: 2,
  },
  [`&.${nodeHudClasses.allowNodeInteraction}`]: {
    // block pointer-events so we can interact with the selection
    pointerEvents: 'none',
  },
}));

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
      : { bottom: 0, transform: 'translate(0, 100%)' }),
  },
}));

const ResizeControlsWrapper = styled('div')({
  userSelect: 'none',
  position: 'absolute',
  zIndex: 3,
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

  return {
    ...dynamicStyles,
    position: 'absolute',
    pointerEvents: 'initial',
    zIndex: 3,
  };
});

const ResizePreview = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary[500],
  opacity: 0.2,
  zIndex: 3,
}));

const MARGIN_CONTROL_EDGES: RectangleEdge[] = [
  RECTANGLE_EDGE_TOP,
  RECTANGLE_EDGE_RIGHT,
  RECTANGLE_EDGE_BOTTOM,
  RECTANGLE_EDGE_LEFT,
];

const DRAGGABLE_SQUARE_SIZE = 16; // px

const DraggableSquare = styled('div', {
  shouldForwardProp: (prop) => prop !== 'edge',
})<{
  edge: RectangleEdge;
}>(({ edge, theme }) => {
  let dynamicStyles = {};

  if (edge === RECTANGLE_EDGE_TOP) {
    dynamicStyles = {
      left: '50%',
      top: -DRAGGABLE_SQUARE_SIZE / 2,
      transform: 'translateX(-50%)',
    };
  }
  if (edge === RECTANGLE_EDGE_RIGHT) {
    dynamicStyles = {
      right: -DRAGGABLE_SQUARE_SIZE / 2,
      top: '50%',
      transform: 'translateY(-50%)',
    };
  }
  if (edge === RECTANGLE_EDGE_BOTTOM) {
    dynamicStyles = {
      left: '50%',
      bottom: -DRAGGABLE_SQUARE_SIZE / 2,
      transform: 'translateX(-50%)',
    };
  }
  if (edge === RECTANGLE_EDGE_LEFT) {
    dynamicStyles = {
      left: -DRAGGABLE_SQUARE_SIZE / 2,
      top: '50%',
      transform: 'translateY(-50%)',
    };
  }

  return {
    ...dynamicStyles,
    position: 'absolute',
    height: DRAGGABLE_SQUARE_SIZE,
    width: DRAGGABLE_SQUARE_SIZE,
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.primary[500]}`,
    transformOrigin: '50% 50%',
    zIndex: 4,
    pointerEvents: 'initial',
  };
});

const MarginPreview = styled('div', {
  shouldForwardProp: (prop) => prop !== 'edge' && prop !== 'isActive',
})<{
  edge: RectangleEdge;
  isActive: boolean;
}>(({ edge, isActive, theme }) => {
  let dynamicStyles = {};

  if (edge === RECTANGLE_EDGE_TOP) {
    dynamicStyles = {
      top: '50%',
      transform: 'translateY(-50% + 1px)',
      right: '-100%',
      width: 400,
      zIndex: 4,
    };
  }
  if (edge === RECTANGLE_EDGE_RIGHT) {
    dynamicStyles = {
      top: '50%',
      transform: 'translateY(-50% + 1px)',
      right: '-100%',
      width: 400,
      zIndex: 4,
    };
  }
  if (edge === RECTANGLE_EDGE_BOTTOM) {
    dynamicStyles = {
      top: '50%',
      transform: 'translateY(-50% + 1px)',
      right: '-100%',
      width: 400,
      zIndex: 4,
    };
  }
  if (edge === RECTANGLE_EDGE_LEFT) {
    dynamicStyles = {
      top: '50%',
      transform: 'translateY(-50% + 1px)',
      right: '-100%',
      width: 400,
      height: 2,
      zIndex: 4,
    };
  }

  return {
    ...dynamicStyles,
    display: isActive ? 'inline' : 'none',
    borderTop: '2px dashed pink',
    position: 'absolute',
  };
});

interface NodeHudProps {
  node: appDom.AppDomNode;
  rect: Rectangle;
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
  isHoverable = true,
}: NodeHudProps) {
  const { dom } = useDom();
  const domApi = useDomApi();

  const [controlledMarginEdge, setControlledMarginEdge] = React.useState<RectangleEdge | null>(
    null,
  );

  const componentId = appDom.isElement(node) ? getElementNodeComponentId(node) : '';
  const component = useToolpadComponent(dom, componentId);

  const handleSquareDragStart = React.useCallback(
    (edge) => (event) => {
      event.stopPropagation();

      setControlledMarginEdge(edge);

      domApi.selectNode(node.id);
    },
    [domApi, node.id],
  );

  const hintPosition = rect.y > HUD_HEIGHT ? HINT_POSITION_TOP : HINT_POSITION_BOTTOM;

  const iconSx = { opacity: 0.7 };

  return (
    <React.Fragment>
      <NodeHudWrapper
        data-node-id={node.id}
        style={absolutePositionCss(rect)}
        className={clsx({
          [nodeHudClasses.allowNodeInteraction]: isInteractive,
        })}
        isOutlineVisible={isOutlineVisible}
        isHoverable={isHoverable}
      >
        {isSelected ? <span className={nodeHudClasses.selected} /> : null}
        {isResizing ? (
          <ResizePreview ref={resizePreviewElementRef} style={absolutePositionCss(rect)} />
        ) : null}
        {controlledMarginEdge
          ? MARGIN_CONTROL_EDGES.map((edge) => (
              <MarginPreview
                key={`${node.id}-margin-preview-${edge}`}
                edge={edge}
                isActive={controlledMarginEdge === edge}
              />
            ))
          : null}
      </NodeHudWrapper>
      {isSelected ? (
        <SelectionHintWrapper style={absolutePositionCss(rect)} hintPosition={hintPosition}>
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
        </SelectionHintWrapper>
      ) : null}
      {onEdgeDragStart ? (
        <ResizeControlsWrapper style={absolutePositionCss(rect)}>
          {draggableEdges.map((edge) => (
            <DraggableEdge
              key={`${node.id}-edge-${edge}`}
              edge={edge}
              onMouseDown={onEdgeDragStart(edge)}
            />
          ))}
          {MARGIN_CONTROL_EDGES.map((edge) => (
            <DraggableSquare
              key={`${node.id}-drag-square-${edge}`}
              edge={edge}
              onMouseDown={handleSquareDragStart(edge)}
            />
          ))}
        </ResizeControlsWrapper>
      ) : null}
    </React.Fragment>
  );
}
