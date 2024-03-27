import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';
import { DataGRidPremium } from '@mui/x-data-grid-premium';

export interface CustomDataGridProps {
  msg: string;
}

function CustomDataGrid({ msg }: CustomDataGridProps) {
  return <div>{msg}</div>;
}

export default createComponent(CustomDataGrid, {
  argTypes: {
    msg: {
      type: 'string',
      default: 'Hello world!',
    },
  },
});
