import * as React from 'react';
import { Button } from '@toolpad/studio-components';

const TOOLPAD_PROPS = {
  variant: 'contained',
  content: 'Hello World',
};

export default function BasicButton() {
  return <Button {...TOOLPAD_PROPS} />;
}
