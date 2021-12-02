import * as React from 'react';
import { PaperProps as InnerPaperProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';
import { update } from '../utils/immutability';

interface PaperComponentProps extends InnerPaperProps {
  children?: React.ReactNode;
}

const Paper: StudioComponentDefinition<PaperComponentProps> = {
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
