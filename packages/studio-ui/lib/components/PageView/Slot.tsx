import { Box } from '@mui/material';
import React from 'react';
import type {
  SlotDirection,
  SlotLayout,
  SlotLayoutCenter,
  SlotLayoutInsert,
  NodeId,
  FlowDirection,
} from '../../types';
import { getRelativeBoundingBox } from '../../utils/geometry';
import { DATA_PROP_SLOT, DATA_PROP_SLOT_DIRECTION } from './contants';
import NodeContext from './NodeContext';
import RenderNodeContext from './RenderNodeContext';

function getSlotDirection(flow: FlowDirection): SlotDirection {
  switch (flow) {
    case 'row':
    case 'row-reverse':
      return 'horizontal';
    case 'column':
    case 'column-reverse':
      return 'vertical';
    default:
      throw new Error(`Invariant: Unrecognized direction "${flow}"`);
  }
}

interface GetInsertSlotsParams {
  nodeElm: HTMLElement;
  name: string;
  direction?: FlowDirection;
  container?: HTMLElement;
  items?: Iterable<Element>;
}

function getInsertSlots({
  nodeElm,
  name,
  direction = 'row',
  container = nodeElm,
  items = nodeElm.children,
}: GetInsertSlotsParams): SlotLayoutInsert[] {
  if (!container) {
    throw new Error(`Invariant: Slots element must have a parent`);
  }

  const rect = getRelativeBoundingBox(nodeElm, container);

  const slotDirection = getSlotDirection(direction);

  const size = slotDirection === 'horizontal' ? rect.height : rect.width;

  const boundaries = Array.from(items, (childElm) => {
    const childRect = getRelativeBoundingBox(nodeElm, childElm);
    switch (direction) {
      case 'row':
        return { start: childRect.x, end: childRect.x + childRect.width };
      case 'column':
        return { start: childRect.y, end: childRect.y + childRect.height };
      case 'row-reverse':
        return { start: childRect.x + childRect.width, end: childRect.x };
      case 'column-reverse':
        return { start: childRect.y + childRect.height, end: childRect.y };
      default:
        throw new Error(`Invariant: Unrecognized direction "${direction}"`);
    }
  });

  const offsets = [];
  if (boundaries.length > 0) {
    offsets.push(boundaries[0].start);
    const lastIdx = boundaries.length - 1;
    for (let i = 0; i < lastIdx; i += 1) {
      offsets.push((boundaries[i].end + boundaries[i + 1].start) / 2);
    }
    offsets.push(boundaries[lastIdx].end);
  }

  return offsets.map(
    (offset, index) =>
      ({
        type: 'insert',
        name,
        index,
        direction: slotDirection,
        x: slotDirection === 'horizontal' ? offset : rect.x,
        y: slotDirection === 'horizontal' ? rect.y : offset,
        size,
      } as const),
  );
}

interface GetSlotParams {
  nodeElm: HTMLElement;
  name: string;
  container?: Element;
}

function getSlot({ nodeElm, name, container = nodeElm }: GetSlotParams): SlotLayoutCenter {
  const rect = getRelativeBoundingBox(nodeElm, container);
  return {
    type: 'slot',
    name,
    index: 0,
    rect,
  };
}

export function getSlots(nodeElm: HTMLElement, elm: Element): SlotLayout[] {
  const result: SlotLayout[] = [];

  const slotName = elm.getAttribute(DATA_PROP_SLOT);
  const direction = elm.getAttribute(DATA_PROP_SLOT_DIRECTION) as FlowDirection | undefined;

  if (slotName) {
    if (direction) {
      if (!elm.parentElement) {
        throw new Error(`Invariant: Slots element must have a parent`);
      }
      result.push(
        ...getInsertSlots({
          nodeElm,
          name: slotName,
          direction,
          container: elm.parentElement,
          items: elm.children,
        }),
      );
    } else {
      result.push(getSlot({ nodeElm, name: slotName, container: elm }));
    }
  }

  return result;
}

export interface SlotsProps {
  name: string;
  direction: FlowDirection;
  children: NodeId[];
}

export function Slots({ children, name, direction }: SlotsProps) {
  const node = React.useContext(NodeContext);
  const renderNode = React.useContext(RenderNodeContext);

  if (!node) {
    throw new Error(`Invariant: Slot used outside of a rendered node`);
  }

  return (
    <div
      style={{ display: 'contents' }}
      {...{ [DATA_PROP_SLOT]: name, [DATA_PROP_SLOT_DIRECTION]: direction }}
    >
      {children.map((childnodeId) => renderNode(childnodeId))}
    </div>
  );
}

export interface SlotProps {
  name: string;
  content?: NodeId | null;
}

export default function Slot({ name, content }: SlotProps) {
  const node = React.useContext(NodeContext);
  const renderNode = React.useContext(RenderNodeContext);

  if (!node) {
    throw new Error(`Invariant: Slot used outside of a rendered node`);
  }

  return content ? (
    <React.Fragment>{renderNode(content)}</React.Fragment>
  ) : (
    <Box
      display="block"
      minHeight={40}
      minWidth={200}
      {...{
        [DATA_PROP_SLOT]: name,
      }}
    />
  );
}
