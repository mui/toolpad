import * as React from 'react';
import { Button } from '@mui/toolpad-components';

const TOOLPAD_PROPS = {
  variant: 'contained',
  content: 'Hello World',
};

export default function BasicButton() {
  return <Button {...TOOLPAD_PROPS} />;
}
