// Just for demo purposes
import * as React from 'react';
import { Grid } from '@mui/material';
import { Placeholder, createComponent } from '@mui/toolpad-core';

export interface CustomLayoutProps {
  child1?: React.ReactNode;
  child2?: React.ReactNode;
  child3?: React.ReactNode;
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

CustomLayout.defaultProps = {};

export default createComponent(CustomLayout, {
  argTypes: {
    child3: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
});
