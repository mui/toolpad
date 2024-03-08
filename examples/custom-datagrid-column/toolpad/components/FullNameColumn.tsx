import * as React from 'react';
import { Typography } from '@mui/material';
import { createComponent } from '@toolpad/studio/browser';

export interface FullNameColumnProps {
  row: {
    age: number;
    firstname: string;
    lastname: string;
  };
}

function FullNameColumn({ row }: FullNameColumnProps) {
  return <Typography noWrap>{`${row.firstname} ${row.lastname}`}</Typography>;
}

export default createComponent(FullNameColumn, {
  argTypes: {
    row: {
      type: 'object',
    },
  },
});
