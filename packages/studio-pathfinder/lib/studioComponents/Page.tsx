import { Container, Stack } from '@mui/material';
import * as React from 'react';
import { StudioComponentDefinition, NodeId } from '../types';
import Slot, { Slots } from '../components/PageView/Slot';
import { setConstProp } from '../studioPage';

const PAGE_DEFAULT_SLOTS: NodeId[] = [];

interface PageComponentProps {
  studioSlots: NodeId[];
}

function PageComponent({ studioSlots, ...props }: PageComponentProps) {
  const gap = 2;
  return (
    <Container {...props}>
      <Stack direction="column" gap={gap} my={2}>
        {studioSlots.length > 0 ? (
          <Slots name="slots" direction="column">
            {studioSlots}
          </Slots>
        ) : (
          <Slot name="slot" content={null} />
        )}
      </Stack>
    </Container>
  );
}

const Page: StudioComponentDefinition<PageComponentProps> = {
  Component: React.memo(PageComponent),
  props: {
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

export default Page;
