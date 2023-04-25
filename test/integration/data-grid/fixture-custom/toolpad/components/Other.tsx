import { createComponent } from '@mui/toolpad/browser';
import * as React from 'react';

export interface Props {
  value: any;
  field: any;
  row: any;
}

function Test() {
  return <div>It worked!</div>;
}

export default createComponent(Test, {
  argTypes: {
    value: {
      typeDef: { type: 'object' },
    },
    row: {
      typeDef: { type: 'object' },
    },
    field: {
      typeDef: { type: 'string' },
      defaultValue: 'Field name',
    },
  },
});
