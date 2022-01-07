import { Grid } from '@mui/material';
import { createComponent } from '@mui/studio-core';
import * as React from 'react';

export interface StudioGridProps {
  children: React.ReactNode;
}

function StudioGrid({ children }: StudioGridProps) {
  return <Grid container>{children}</Grid>;
}

export default createComponent(StudioGrid, {
  props: {
    children: {
      type: 'elements',
      control: 'GridItems',
      defaultValue: null,
    },
  },
});
