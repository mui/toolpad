import { Stack as InnerStackComponent, StackProps } from '@mui/material';
import React from 'react';
import { StudioComponentDefinition, NodeId } from '../types';
import Slot, { Slots } from '../components/PageView/Slot';
import { setConstProp } from '../studioPage';

const PAGE_DEFAULT_SLOTS: NodeId[] = [];

interface StackComponentProps extends StackProps {
  // TODO: support more values for gap and direction
  gap?: number;
  direction?: 'row' | 'column';
  studioSlots: NodeId[];
}

function StackComponent({ studioSlots, ...props }: StackComponentProps) {
  return (
    <InnerStackComponent {...props}>
      {studioSlots.length > 0 ? (
        <Slots name="slots" direction={props.direction || 'row'}>
          {studioSlots}
        </Slots>
      ) : (
        <Slot name="slot" content={null} />
      )}
    </InnerStackComponent>
  );
}

const Stack: StudioComponentDefinition<StackComponentProps> = {
  Component: React.memo(StackComponent),
  props: {
    gap: { type: 'number', defaultValue: 2 },
    direction: {
      type: 'Direction',
      defaultValue: 'row',
    },
    alignItems: {
      type: 'StackAlignment',
      defaultValue: 'center',
    },
    studioSlots: {
      type: 'Nodes',
      defaultValue: PAGE_DEFAULT_SLOTS,
    },
  },
  reducer: (node, action) => {
    switch (action.type) {
      case 'FILL_SLOT': {
        const oldValue =
          node.props.studioSlots?.type === 'const'
            ? node.props.studioSlots.value
            : PAGE_DEFAULT_SLOTS;

        const newValue = [
          ...oldValue.slice(0, action.index),
          action.nodeId,
          ...oldValue.slice(action.index),
        ];

        return setConstProp(node, 'studioSlots', newValue);
      }
      case 'CLEAR_SLOT': {
        const oldValue =
          node.props.studioSlots?.type === 'const'
            ? node.props.studioSlots.value
            : PAGE_DEFAULT_SLOTS;

        const newValue = oldValue.filter((slot) => slot !== action.nodeId);

        return setConstProp(node, 'studioSlots', newValue);
      }
      default:
        return node;
    }
  },
  getChildren: (node) =>
    node.props.studioSlots?.type === 'const' ? node.props.studioSlots.value : [],
};

export default Stack;
