import * as React from 'react';
import { Typography } from '@mui/material';
import { EditorProps } from '../../types';

function Editor({ label }: EditorProps<any>) {
  // No editor, bindings only
  return <Typography>{label}</Typography>;
}

export default Editor;
