import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';

export interface MyTextFieldProps {
  msg: string;
  onMsgChange: (newMsg: string) => void;
}

function MyTextField({ msg, onMsgChange }: MyTextFieldProps) {
  return <input value={msg} onChange={(event) => onMsgChange(event.target.value)} />;
}

export default createComponent(MyTextField, {
  argTypes: {
    msg: {
      type: 'string',
      default: 'Hello world!',
      onChangeProp: 'onMsgChange',
    },
  },
});
