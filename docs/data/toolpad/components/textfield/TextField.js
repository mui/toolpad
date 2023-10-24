import * as React from 'react';
import { TextField } from '@mui/toolpad-components';

const TOOLPAD_PROPS = {
  label: 'Enter name',
  size: 'small',
  placeholder: 'This is a placeholder',
};

export default function BasicDatepicker() {
  return <TextField {...TOOLPAD_PROPS} />;
}
