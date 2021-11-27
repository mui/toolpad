import * as React from 'react';
import { Paper as InnerPaper, PaperProps as InnerPaperProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';
import Slot from '../components/PageViewLegacy/Slot';
import { update } from '../utils/immutability';

interface PaperComponentProps extends InnerPaperProps {
  children?: React.ReactNode;
}

function PaperComponent({ children, ...props }: PaperComponentProps) {
  return (
    <InnerPaper {...props} sx={{ padding: 1 }}>
      <Slot name={'content'}>{children}</Slot>
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
  render(context, node, resolvedProps) {
    context.addImport('@mui/material', 'Paper', 'Paper');
    return `
      <Paper 
        ${context.renderRootProps(node.id)} 
        sx={{ padding: 1 }} 
        ${context.renderProps(resolvedProps)}
      >
        ${
          node.children.length > 0
            ? context.renderNode(node.children[0])
            : context.renderPlaceholder('content')
        }
      </Paper>
    `;
  },
};

export default Paper;
