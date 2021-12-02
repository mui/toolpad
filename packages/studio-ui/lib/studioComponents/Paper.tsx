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

  render(context, resolvedProps, children) {
    context.addImport('@mui/material', 'Paper', 'Paper');
    context.addImport('@mui/studio-core', 'Slot', 'Slot');
    return `
      <Paper 
        sx={{ padding: 1 }} 
        ${context.renderProps(resolvedProps)}
      >
        <Slot>
          ${children}
        </Slot>
      </Paper>
    `;
  },
};

export default Paper;
