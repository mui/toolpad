import * as React from 'react';
import { Typography } from '@mui/material';
import { EditorProps, PropControlDefinition } from '../../types';

function Editor({ label }: EditorProps<any>) {
  // No editor, bindings only
  return <Typography>{label}</Typography>;
}

const functionType: PropControlDefinition<string> = {
  Editor,
};

export default functionType;
