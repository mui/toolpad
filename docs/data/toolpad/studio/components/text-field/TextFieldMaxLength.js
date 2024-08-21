import * as React from 'react';
import { TextField } from '@toolpad/studio-components';

export default function TextFieldMaxLength() {
  return (
    <TextField
      label="Zip code"
      size="small"
      maxLength="6"
      placeholder="Enter zip code"
      sx={{ width: 280 }}
    />
  );
}
