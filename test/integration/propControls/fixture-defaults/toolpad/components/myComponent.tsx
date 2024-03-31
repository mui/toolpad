import * as React from 'react';
import { Typography } from '@mui/material';
import { createComponent } from '@toolpad/studio/browser';

export interface myComponentProps {
  msg: string;
}

function myComponent({ msg }: myComponentProps) {
  return <Typography>{msg}</Typography>;
}

export default createComponent(myComponent, {
  argTypes: {
    msg: {
      typeDef: { type: 'string' },
      defaultValue: 'Hello world!',
    },
  },
});
