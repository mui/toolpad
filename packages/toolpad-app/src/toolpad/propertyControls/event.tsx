import * as React from 'react';
import { Typography } from '@mui/material';
import { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

function Editor({ propType, label }: EditorProps<any>) {
  // No editor, bindings only
  return (
    <PropertyControl propType={propType}>
      <Typography>{label}</Typography>
    </PropertyControl>
  );
}

export default Editor;
