import { SlotState } from '../types';

export function isHorizontalSlot(slot: SlotState): boolean {
  return slot.flowDirection === 'row' || slot.flowDirection === 'row-reverse';
}

export function isVerticalSlot(slot: SlotState): boolean {
  return slot.flowDirection === 'column' || slot.flowDirection === 'column-reverse';
}

export function isReverseSlot(slot: SlotState): boolean {
  return slot.flowDirection === 'row-reverse' || slot.flowDirection === 'column-reverse';
}
