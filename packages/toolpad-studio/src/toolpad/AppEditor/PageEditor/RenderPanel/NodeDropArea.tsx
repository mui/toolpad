import * as React from 'react';
import clsx from 'clsx';
import { styled } from '@mui/material';
import Typography from '@mui/material/Typography';

import * as appDom from '@toolpad/studio-runtime/appDom';
import { FlowDirection } from '../../../../types';
import {
  absolutePositionCss,
  isHorizontalFlow,
  isVerticalFlow,
  Rectangle,
} from '../../../../utils/geometry';

import { useAppState } from '../../../AppState';

import {
  DROP_ZONE_CENTER,
  DROP_ZONE_BOTTOM,
  DROP_ZONE_LEFT,
  DROP_ZONE_RIGHT,
  DROP_ZONE_TOP,
  DropZone,
  usePageEditorState,
} from '../PageEditorProvider';
import { isPageRow } from '../../../../runtime/toolpadComponents';

const dropAreaHighlightClasses = {
  highlightedTop: 'DropArea_HighlightedTop',
  highlightedRight: 'DropArea_HighlightedRight',
  highlightedBottom: 'DropArea_HighlightedBottom',
  highlightedLeft: 'DropArea_HighlightedLeft',
  highlightedCenter: 'DropArea_HighlightedCenter',
};

const StyledNodeDropArea = styled('div', {
  shouldForwardProp: (prop) => prop !== 'highlightRelativeRect',
})<{
  highlightRelativeRect?: Partial<Rectangle>;
}>(({ highlightRelativeRect = {}, theme }) => {
  const {
    x: highlightRelativeX = 0,
    y: highlightRelativeY = 0,
    width: highlightWidth = '100%',
    height: highlightHeight = '100%',
  } = highlightRelativeRect;

  return {
    pointerEvents: 'none',
    position: 'absolute',
    [`&.${dropAreaHighlightClasses.highlightedTop}`]: {
      '&::after': {
        backgroundColor: theme.palette.primary[500],
        content: "''",
        position: 'absolute',
        height: 2,
        width: highlightWidth,
        top: -1,
        left: highlightRelativeX,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedRight}`]: {
      '&::after': {
        backgroundColor: theme.palette.primary[500],
        content: "''",
        position: 'absolute',
        height: highlightHeight,
        width: 2,
        top: highlightRelativeY,
        right: -1,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedBottom}`]: {
      '&::after': {
        backgroundColor: theme.palette.primary[500],
        content: "''",
        position: 'absolute',
        height: 2,
        width: highlightWidth,
        bottom: -1,
        left: highlightRelativeX,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedLeft}`]: {
      '&::after': {
        backgroundColor: theme.palette.primary[500],
        content: "''",
        position: 'absolute',
        height: highlightHeight,
        width: 2,
        left: -1,
        top: highlightRelativeY,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedCenter}`]: {
      border: `2px solid ${theme.palette.primary[500]}`,
    },
  };
});

const EmptySlot = styled('div')(({ theme }) => ({
  alignItems: 'center',
  border: `2px dotted ${theme.palette.primary[500]}`,
  color: theme.palette.primary[500],
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'absolute',
  textAlign: 'center',
}));

function getChildNodeHighlightedZone(parentFlowDirection: FlowDirection): DropZone | null {
  switch (parentFlowDirection) {
    case 'row':
      return DROP_ZONE_RIGHT;
    case 'column':
      return DROP_ZONE_BOTTOM;
    case 'row-reverse':
      return DROP_ZONE_LEFT;
    case 'column-reverse':
      return DROP_ZONE_TOP;
    default:
      return null;
  }
}

function getHighlightedZoneOverlayClass(
  highlightedZone: DropZone,
): (typeof dropAreaHighlightClasses)[keyof typeof dropAreaHighlightClasses] | null {
  switch (highlightedZone) {
    case DROP_ZONE_TOP:
      return dropAreaHighlightClasses.highlightedTop;
    case DROP_ZONE_RIGHT:
      return dropAreaHighlightClasses.highlightedRight;
    case DROP_ZONE_BOTTOM:
      return dropAreaHighlightClasses.highlightedBottom;
    case DROP_ZONE_LEFT:
      return dropAreaHighlightClasses.highlightedLeft;
    case DROP_ZONE_CENTER:
      return dropAreaHighlightClasses.highlightedCenter;
    default:
      return null;
  }
}

interface NodeDropAreaProps {
  node: appDom.AppDomNode;
  parentProp: string | null;
  dropAreaRect: Rectangle;
  availableDropZones: DropZone[];
}

export default function NodeDropArea({
  node,
  parentProp,
  dropAreaRect,
  availableDropZones,
}: NodeDropAreaProps) {
  const { dom } = useAppState();
  const { dragOverNodeId, dragOverSlotParentProp, dragOverZone, viewState } = usePageEditorState();

  const { nodes: nodesInfo } = viewState;

  const dropAreaNodeInfo = nodesInfo[node.id];
  const dropAreaNodeRect = dropAreaNodeInfo?.rect || null;
  const dropAreaNodeSlots = dropAreaNodeInfo?.slots;

  const slotRect = (dropAreaNodeSlots && parentProp && dropAreaNodeSlots[parentProp]?.rect) || null;

  const dropAreaNodeParent = appDom.getParent(dom, node);
  const dropAreaNodeParentInfo = dropAreaNodeParent && nodesInfo[dropAreaNodeParent.id];
  const dropAreaNodeParentRect = dropAreaNodeParentInfo?.rect || null;
  const dropAreaNodeParentSlots = dropAreaNodeParentInfo?.slots;
  const dropAreaNodeParentSlot =
    dropAreaNodeParentSlots && parentProp && dropAreaNodeParentSlots[parentProp];

  const isPageNode = appDom.isPage(node);
  const isPageChild = dropAreaNodeParent ? appDom.isPage(dropAreaNodeParent) : false;

  const isPageRowNode = appDom.isElement(node) && isPageRow(node);

  const isPageChildElement = isPageChild && appDom.isElement(node) && !isPageRow(node);
  const isPageRowChild = dropAreaNodeParent
    ? appDom.isElement(dropAreaNodeParent) && isPageRow(dropAreaNodeParent)
    : false;

  const dropAreaNodeChildNodes = React.useMemo(
    () => appDom.getChildNodes(dom, node) as appDom.NodeChildren<appDom.ElementNode>,
    [dom, node],
  );

  const dropAreaSlotChildNodes = parentProp ? dropAreaNodeChildNodes[parentProp] || [] : [];
  const isEmptySlot = dropAreaSlotChildNodes.length === 0;

  const highlightedZone = React.useMemo((): DropZone | null => {
    if (dragOverZone && !availableDropZones.includes(dragOverZone)) {
      return null;
    }
    if (isPageNode && parentProp && !isEmptySlot) {
      return null;
    }

    const dropAreaParentParent = dropAreaNodeParent && appDom.getParent(dom, dropAreaNodeParent);

    const pageAwareParentProp = isPageChild ? 'children' : parentProp;

    if (dragOverZone === DROP_ZONE_TOP && !parentProp) {
      // Is dragging over page top and is slot
      if (
        dropAreaNodeParent &&
        dropAreaNodeParent.id === dragOverNodeId &&
        appDom.isPage(dropAreaNodeParent) &&
        pageAwareParentProp
      ) {
        const pageFirstChild = appDom.getNodeFirstChild(dom, dropAreaNodeParent, 'children');

        const isPageFirstChild = pageFirstChild ? node.id === pageFirstChild.id : false;

        return isPageFirstChild ? DROP_ZONE_TOP : null;
      }
    }

    if (dragOverZone === DROP_ZONE_LEFT || dragOverZone === DROP_ZONE_RIGHT) {
      // Is dragging beyond the left or right of parent row slot, and parent row is a child of the page
      if (
        dropAreaNodeParent &&
        dropAreaParentParent &&
        dropAreaNodeParent.id === dragOverNodeId &&
        appDom.isElement(dropAreaNodeParent) &&
        isPageRowChild &&
        appDom.isPage(dropAreaParentParent) &&
        !parentProp
      ) {
        const parentHighlightedChild =
          dragOverZone === DROP_ZONE_LEFT
            ? appDom.getNodeFirstChild(dom, dropAreaNodeParent, 'children')
            : appDom.getNodeLastChild(dom, dropAreaNodeParent, 'children');

        const isParentHighlightedChild = parentHighlightedChild
          ? node.id === parentHighlightedChild.id
          : false;

        return isParentHighlightedChild ? dragOverZone : null;
      }

      // Is dragging over left, is page row and child of the page
      if (dropAreaNodeParent && isPageRowNode && isPageChild) {
        return null;
      }
    }

    if (dragOverZone === DROP_ZONE_CENTER) {
      // Is dragging over parent element center
      if (
        dropAreaNodeParent &&
        dropAreaNodeParent.id === dragOverNodeId &&
        (pageAwareParentProp === dragOverSlotParentProp || !parentProp)
      ) {
        const parentLastChild =
          appDom.isPage(dropAreaNodeParent) || appDom.isElement(dropAreaNodeParent)
            ? appDom.getNodeLastChild(dom, dropAreaNodeParent, pageAwareParentProp || 'children')
            : null;

        const isParentLastChild = parentLastChild ? node.id === parentLastChild.id : false;

        const parentSlots = dropAreaNodeParentInfo?.slots || null;

        const parentFlowDirection =
          parentSlots && parentSlots[pageAwareParentProp || 'children']?.flowDirection;

        return parentFlowDirection && isParentLastChild
          ? getChildNodeHighlightedZone(parentFlowDirection)
          : null;
      }

      // Is dragging over slot center
      if (
        node.id === dragOverNodeId &&
        pageAwareParentProp &&
        pageAwareParentProp === dragOverSlotParentProp &&
        parentProp
      ) {
        if (isPageNode) {
          return DROP_ZONE_CENTER;
        }

        const nodeChildren =
          (pageAwareParentProp &&
            appDom.isElement(node) &&
            dropAreaNodeChildNodes[pageAwareParentProp]) ||
          [];
        return nodeChildren.length === 0 ? DROP_ZONE_CENTER : null;
      }
    }

    // Common cases
    return node.id === dragOverNodeId && parentProp === dragOverSlotParentProp
      ? dragOverZone
      : null;
  }, [
    dragOverZone,
    availableDropZones,
    isPageNode,
    parentProp,
    isEmptySlot,
    dropAreaNodeParent,
    dom,
    isPageChild,
    node,
    dragOverNodeId,
    dragOverSlotParentProp,
    isPageRowChild,
    isPageRowNode,
    dropAreaNodeParentInfo?.slots,
    dropAreaNodeChildNodes,
  ]);

  const highlightedZoneOverlayClass =
    highlightedZone && getHighlightedZoneOverlayClass(highlightedZone);

  const isHorizontalContainerChild = dropAreaNodeParentSlot
    ? isHorizontalFlow(dropAreaNodeParentSlot.flowDirection)
    : false;
  const isVerticalContainerChild = dropAreaNodeParentSlot
    ? isVerticalFlow(dropAreaNodeParentSlot.flowDirection)
    : false;

  const highlightParentRect = slotRect || dropAreaNodeParentRect;

  if (!dropAreaNodeRect) {
    return null;
  }

  const highlightHeight =
    isHorizontalContainerChild && highlightParentRect && dropAreaNodeParentRect
      ? highlightParentRect.height
      : dropAreaNodeRect.height;
  const highlightWidth =
    !isPageChild && isVerticalContainerChild && highlightParentRect && dropAreaNodeParentRect
      ? highlightParentRect.width
      : dropAreaNodeRect.width;

  const highlightRelativeX =
    (!isPageChild && isVerticalContainerChild && highlightParentRect && dropAreaNodeParentRect
      ? highlightParentRect.x
      : dropAreaNodeRect.x) - dropAreaRect.x;
  const highlightRelativeY =
    (isHorizontalContainerChild && highlightParentRect && dropAreaNodeParentRect
      ? highlightParentRect.y
      : dropAreaNodeRect.y) - dropAreaRect.y;

  const isHighlightingCenter = highlightedZone === DROP_ZONE_CENTER;

  const highlightRect =
    isHighlightingCenter && isEmptySlot && slotRect
      ? slotRect
      : {
          ...dropAreaRect,
          x: isPageChildElement ? dropAreaNodeRect.x : dropAreaRect.x,
          width: isPageChildElement ? dropAreaNodeRect.width : dropAreaRect.width,
        };

  const highlightRelativeRect = {
    x: isPageChildElement ? 0 : highlightRelativeX,
    y: highlightRelativeY,
    width: highlightWidth,
    height: highlightHeight,
  };

  return (
    <React.Fragment>
      <StyledNodeDropArea
        style={absolutePositionCss(highlightRect)}
        className={clsx(
          highlightedZoneOverlayClass
            ? {
                [highlightedZoneOverlayClass]: !isHighlightingCenter || isEmptySlot,
              }
            : {},
        )}
        highlightRelativeRect={highlightRelativeRect}
      />
      {isEmptySlot && slotRect ? (
        <EmptySlot style={absolutePositionCss(slotRect)}>
          <Typography variant="subtitle2">Drop component here</Typography>
        </EmptySlot>
      ) : null}
    </React.Fragment>
  );
}
