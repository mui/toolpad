import * as React from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { createComponent } from '@toolpad/studio/browser';

export interface OrderIdChipProps {
  value: string;
}

function OrderIdChip({ value }: OrderIdChipProps) {
  return (
    <Tooltip title={value}>
      <Chip label={value.slice(0, 7)} />
    </Tooltip>
  );
}

export default createComponent(OrderIdChip, {
  argTypes: {
    value: {
      type: 'string',
      default: '',
    },
  },
});
