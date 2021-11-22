import * as React from 'react';
import { Paper as InnerPaper, PaperProps as InnerPaperProps } from '@mui/material';
import type { NodeId, StudioComponentDefinition } from '../types';
import { setConstProp } from '../studioPage';
import Slot from '../components/PageView/Slot';

interface PaperComponentProps extends InnerPaperProps {
  studioSlot: NodeId | null;
}

function PaperComponent({ studioSlot, ...props }: PaperComponentProps) {
  return (
    <InnerPaper {...props} sx={{ padding: 1 }}>
      <Slot name={'content'} content={studioSlot} />
    </InnerPaper>
  );
}

const Paper: StudioComponentDefinition<PaperComponentProps> = {
  Component: React.memo(PaperComponent),
  props: {
    elevation: {
      type: 'number',
      defaultValue: 1,
    },
    studioSlot: {
      type: 'Node',
      defaultValue: null,
    },
  },
  reducer: (node, action) => {
    switch (action.type) {
      case 'FILL_SLOT': {
        return setConstProp(node, 'studioSlot', action.nodeId);
      }
      case 'CLEAR_SLOT': {
        return setConstProp(node, 'studioSlot', null);
      }
      default:
        return node;
    }
  },
  getChildren: (node) =>
    node.props.studioSlot?.type === 'const' && node.props.studioSlot.value
      ? [node.props.studioSlot.value]
      : [],
};

export default Paper;
