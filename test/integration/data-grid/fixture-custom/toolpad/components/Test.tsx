import { createComponent } from '@mui/toolpad-core';
import * as React from 'react';

export interface Props {
  value: any;
  field: any;
  row: any;
}

function Test({ value, field, row }: Props) {
  return (
    <div>
      value: {JSON.stringify(value)}
      <br />
      row: {JSON.stringify(row)}
      <br />
      field: {JSON.stringify(field)}
    </div>
  );
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
