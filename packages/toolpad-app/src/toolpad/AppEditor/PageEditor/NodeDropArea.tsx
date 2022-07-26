import * as React from 'react';
import clsx from 'clsx';
import { styled } from '@mui/material';
import { NodeInfo } from '../../../types';
import * as appDom from '../../../appDom';
import { absolutePositionCss, Rectangle } from '../../../utils/geometry';
import {
  DropZone,
  DROP_ZONE_BOTTOM,
  DROP_ZONE_CENTER,
  DROP_ZONE_LEFT,
  DROP_ZONE_RIGHT,
  DROP_ZONE_TOP,
} from './PageEditorProvider';
import { isHorizontalSlot, isVerticalSlot } from '../../../utils/pageView';

const dropAreaHighlightClasses = {
  highlightedTop: 'DropArea_HighlightedTop',
  highlightedRight: 'DropArea_HighlightedRight',
  highlightedBottom: 'DropArea_HighlightedBottom',
  highlightedLeft: 'DropArea_HighlightedLeft',
  highlightedCenter: 'DropArea_HighlightedCenter',
};

function getHighlightedZoneOverlayClass(
  highlightedZone: DropZone,
): typeof dropAreaHighlightClasses[keyof typeof dropAreaHighlightClasses] | null {
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

const StyledNodeDropArea = styled('div', {
  shouldForwardProp: (prop) => prop !== 'highlightRelativeRect',
})<{
  highlightRelativeRect?: Partial<Rectangle>;
}>(({ highlightRelativeRect = {} }) => {
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
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: 4,
        width: highlightWidth,
        top: -2,
        left: highlightRelativeX,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedRight}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: highlightHeight,
        width: 4,
        top: highlightRelativeY,
        right: -2,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedBottom}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: 4,
        width: highlightWidth,
        bottom: -2,
        left: highlightRelativeX,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedLeft}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: highlightHeight,
        width: 4,
        left: -2,
        top: highlightRelativeY,
      },
    },
    [`&.${dropAreaHighlightClasses.highlightedCenter}`]: {
      border: '4px solid #44EB2D',
    },
  };
});

const EmptySlot = styled('div')({
  alignItems: 'center',
  border: '1px dashed green',
  color: 'green',
  display: 'flex',
  fontSize: 20,
  justifyContent: 'center',
  position: 'absolute',
  opacity: 0.75,
});

interface NodeDropAreaProps {
  node: appDom.ElementNode | appDom.PageNode;
  parentInfo: NodeInfo | null;
  layoutRect: Rectangle;
  dropAreaRect: Rectangle;
  slotRect?: Rectangle;
  highlightedZone?: DropZone | null;
  isEmptySlot: boolean;
  isPageChild: boolean;
}

export default function NodeDropArea({
  node,
  highlightedZone,
  parentInfo,
  layoutRect,
  slotRect,
  dropAreaRect,
  isEmptySlot,
  isPageChild,
}: NodeDropAreaProps) {
  const highlightedZoneOverlayClass =
    highlightedZone && getHighlightedZoneOverlayClass(highlightedZone);

  const nodeParentProp = node.parentProp;

  const parentSlots = parentInfo?.slots;
  const parentSlot = parentSlots && nodeParentProp && parentSlots[nodeParentProp];

  const parentRect = parentInfo?.rect;

  const isHorizontalContainerChild = parentSlot ? isHorizontalSlot(parentSlot) : false;
  const isVerticalContainerChild = parentSlot ? isVerticalSlot(parentSlot) : false;

  const highlightHeight =
    isHorizontalContainerChild && parentRect ? parentRect.height : layoutRect.height;
  const highlightWidth =
    !isPageChild && isVerticalContainerChild && parentRect ? parentRect.width : layoutRect.width;

  const highlightRelativeX =
    (!isPageChild && isVerticalContainerChild && parentRect ? parentRect.x : layoutRect.x) -
    dropAreaRect.x;
  const highlightRelativeY =
    (isHorizontalContainerChild && parentRect ? parentRect.y : layoutRect.y) - dropAreaRect.y;

  const isHighlightingCenter = highlightedZone === DROP_ZONE_CENTER;

  const highlightRect = isHighlightingCenter && isEmptySlot && slotRect ? slotRect : dropAreaRect;

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
        highlightRelativeRect={{
          x: highlightRelativeX,
          y: highlightRelativeY,
          width: highlightWidth,
          height: highlightHeight,
        }}
      />
      {isEmptySlot && slotRect ? (
        <EmptySlot style={absolutePositionCss(slotRect)}>+</EmptySlot>
      ) : null}
    </React.Fragment>
  );
}
