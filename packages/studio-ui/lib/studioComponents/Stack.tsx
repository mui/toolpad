import { StackProps } from '@mui/material';
import React from 'react';
import type { StudioComponentDefinition } from '../types';

interface StackComponentProps extends StackProps {
  // TODO: support more values for gap and direction
  gap?: number;
  direction?: 'row' | 'column';
  children?: React.ReactNode;
}

const Stack: StudioComponentDefinition<StackComponentProps> = {
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
  },
  render(context, resolvedProps, children) {
    context.addImport('@mui/material', 'Stack', 'Stack');
    context.addImport('@mui/studio-core', 'Slots', 'Slots');
    return `
      <Stack ${context.renderProps(resolvedProps)}>
        <Slots direction={${resolvedProps.direction}}>
          ${children}
        </Slots>
      </Stack>
    `;
  },
};

export default Stack;
