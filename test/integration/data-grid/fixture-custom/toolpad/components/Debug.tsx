import { createComponent } from '@toolpad/studio/browser';
import * as React from 'react';

export interface Props {
  value: any;
  field: any;
  row: any;
}

function Test({ value, field }: Props) {
  return (
    <div>
      [{field}:{value}]
    </div>
  );
}

export default createComponent(Test, {
  argTypes: {
    value: {
      type: 'object',
    },
    row: {
      type: 'object',
    },
    field: {
      type: 'string',
      defaultValue: 'Field name',
    },
  },
});
