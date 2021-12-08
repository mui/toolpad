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
  module: '@mui/studio-components',
  importedName: 'Paper',
};

export default Paper;
