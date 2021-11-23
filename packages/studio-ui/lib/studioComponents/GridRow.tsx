import { Box } from '@mui/material';
import * as React from 'react';
import { GridProps } from '@mui/system';
import type { StudioComponentDefinition, GridSlot } from '../types';
import Slot from '../components/PageView/Slot';
import { setConstProp } from '../studioPage';

const GRID_ROW_DEFAULT_SLOTS: GridSlot[] = [{ span: 6, content: null }];

interface GridRowComponentProps extends GridProps {
  studioSlots: GridSlot[];
}

function GridRowComponent({ studioSlots, ...props }: GridRowComponentProps) {
  return (
    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2} {...props}>
      {studioSlots.map((studioSlot, slotIdx) => {
        return (
          <Slot
            key={slotIdx}
            name={String(slotIdx)}
            content={studioSlot.content}
            gridColumn={`span ${studioSlot.span}`}
            minHeight={100}
          />
        );
      })}
    </Box>
  );
}

const GridRow: StudioComponentDefinition<GridRowComponentProps> = {
  Component: React.memo(GridRowComponent),
  props: {
    studioSlots: {
      type: 'GridSlots',
      defaultValue: GRID_ROW_DEFAULT_SLOTS,
    },
  },
  reducer: (node, action) => {
    switch (action.type) {
      case 'FILL_SLOT': {
        const index = Number(action.slot);
        const oldValue =
          node.props.studioSlots?.type === 'const'
            ? node.props.studioSlots.value
            : GRID_ROW_DEFAULT_SLOTS;

        const newValue = oldValue.map((slot, i) =>
          i === index ? { ...slot, content: action.nodeId } : slot,
        );

        return setConstProp(node, 'studioSlots', newValue);
      }
      case 'CLEAR_SLOT': {
        const oldValue =
          node.props.studioSlots?.type === 'const'
            ? node.props.studioSlots.value
            : GRID_ROW_DEFAULT_SLOTS;

        const newValue = oldValue.map((slot) =>
          slot.content === action.nodeId ? { ...slot, content: null } : slot,
        );

        return setConstProp(node, 'studioSlots', newValue);
      }
      default:
        return node;
    }
  },
  getChildren: (node) =>
    node.props.studioSlots?.type === 'const'
      ? node.props.studioSlots.value.flatMap((slot) => (slot.content ? [slot.content] : []))
      : [],
};

export default GridRow;
