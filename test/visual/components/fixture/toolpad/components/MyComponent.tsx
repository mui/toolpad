import * as React from 'react';
import { Typography } from '@mui/material';
import { createComponent } from '@mui/toolpad/browser';

export interface MyComponentProps {
  msg: string;
}

function myComponent({ msg }: MyComponentProps) {
  return <Typography>custom component {msg}</Typography>;
}

export default createComponent(myComponent, {
  argTypes: {
    msg: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
  },
});
