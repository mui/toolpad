import * as React from 'react';
import { PaperProps as InnerPaperProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';

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
