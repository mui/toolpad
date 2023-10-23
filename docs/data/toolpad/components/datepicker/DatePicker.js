import * as React from 'react';
import { DatePicker } from '@mui/toolpad-components';

const TOOLPAD_PROPS = {
  label: 'Enter date',
  size: 'small',
};

export default function BasicDatepicker() {
  return <DatePicker {...TOOLPAD_PROPS} />;
}
