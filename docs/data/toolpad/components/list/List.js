import * as React from 'react';
import { List } from '@mui/toolpad-components';

const TOOLPAD_PROPS = {
  itemCount: 2,
};

export default function BasicList() {
  return <List {...TOOLPAD_PROPS} />;
}
