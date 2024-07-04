import invariant from 'invariant';
import { FlowDirection, SlotType } from '@toolpad/studio-runtime';
import { NodeInfo, SlotsState } from '../types';
import { getRelativeBoundingRect, getRelativeOuterRect } from '../utils/geometry';

export function updateNodeInfo(nodeInfo: NodeInfo, rootElm: Element): NodeInfo {
  const nodeElm = rootElm.querySelector(`[data-toolpad-node-id="${nodeInfo.nodeId}"]`);

  if (!nodeElm) {
    return nodeInfo;
  }

  const rect = getRelativeOuterRect(rootElm, nodeElm);

  const slotElms = rootElm.querySelectorAll(`[data-toolpad-slot-parent="${nodeInfo.nodeId}"]`);

  const slots: SlotsState = {};

  for (const slotElm of slotElms) {
    const slotName = slotElm.getAttribute('data-toolpad-slot-name');
    const slotType = slotElm.getAttribute('data-toolpad-slot-type');

    invariant(slotName, 'Slot name not found');
    invariant(slotType, 'Slot type not found');

    if (slots[slotName]) {
      continue;
    }

    const slotRect =
      slotType === 'single'
        ? getRelativeBoundingRect(rootElm, slotElm)
        : getRelativeBoundingRect(rootElm, slotElm);

    const display = window.getComputedStyle(slotElm).display;
    let flowDirection: FlowDirection = 'row';
    if (slotType === 'layout') {
      flowDirection = 'column';
    } else if (display === 'grid') {
      const gridAutoFlow = window.getComputedStyle(slotElm).gridAutoFlow;
      flowDirection = gridAutoFlow === 'row' ? 'column' : 'row';
    } else if (display === 'flex') {
      flowDirection = window.getComputedStyle(slotElm).flexDirection as FlowDirection;
    }

    slots[slotName] = {
      type: slotType as SlotType,
      rect: slotRect,
      flowDirection,
    };
  }

  return { ...nodeInfo, rect, slots };
}
