import * as React from 'react';
import { Paper as InnerPaper, PaperProps as InnerPaperProps } from '@mui/material';
import type { NodeId, StudioComponentDefinition } from '../types';
import Slot from '../components/PageView/Slot';
import { update } from '../utils/immutability';

interface PaperComponentProps extends InnerPaperProps {
  children: NodeId[];
}

function PaperComponent({ children, ...props }: PaperComponentProps) {
  return (
    <InnerPaper {...props} sx={{ padding: 1 }}>
      <Slot name={'content'} content={children.length > 0 ? children[0] : null} />
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
  },
  reducer: (node, action) => {
    switch (action.type) {
      case 'FILL_SLOT': {
        return update(node, {
          children: [action.nodeId],
        });
      }
      case 'CLEAR_SLOT': {
        return update(node, {
          children: [],
        });
      }
      default:
        return node;
    }
  },
  render(context, node) {
    context.addImport('@mui/material/Paper', 'default', 'Paper');
    return `
      <Paper ${context.renderProps(node.id)}>
          ${node.children.length > 0 ? context.renderNode(node.children[0]) : ''}
      </Paper>
    `;
  },
};

export default Paper;
