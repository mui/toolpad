import * as React from 'react';
import { Typography } from '@mui/material';
import { createComponent } from '@toolpad/studio/browser';

export interface MyComponentProps {
  msg: string;
}

function myComponent({ msg }: MyComponentProps) {
  return <Typography>custom component {msg}</Typography>;
}

export default createComponent(myComponent, {
  argTypes: {
    msg: {
      type: 'string',
      defaultValue: '',
    },
  },
});
