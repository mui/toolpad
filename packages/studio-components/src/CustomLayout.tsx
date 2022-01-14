import * as React from 'react';
import { createComponent, Placeholder } from '@mui/studio-core';
import Grid from '@mui/material/Grid';

export interface CustomLayoutProps {
  child1: React.ReactNode;
  child2: React.ReactNode;
  child3: React.ReactNode;
}

function CustomLayout({ child1, child2, child3 }: CustomLayoutProps) {
  return (
    <Grid container>
      <Grid item>
        <Placeholder prop="child1">{child1}</Placeholder>
      </Grid>
      <Grid item>
        <Placeholder prop="child2">{child2}</Placeholder>
      </Grid>
      <Grid item>{child3}</Grid>
    </Grid>
  );
}

export default createComponent(CustomLayout, {
  argTypes: {
    child3: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
});
