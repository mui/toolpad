import { Grid } from '@mui/material';
import { createComponent } from '@mui/studio-core';
import * as React from 'react';

export interface StudioGridItemProps {
  children?: React.ReactNode;
}

function StudioGridItem({ children }: StudioGridItemProps) {
  return <Grid item>{children}</Grid>;
}

export default createComponent(StudioGridItem, {
  props: {
    span: {
      type: 'number',
      defaultValue: [],
    },
    children: {
      type: 'slot',
      defaultValue: null,
    },
  },
});
