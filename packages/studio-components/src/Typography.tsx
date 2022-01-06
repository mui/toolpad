import { createComponent } from '@mui/studio-core';
import Typography from '@mui/material/Typography';

const defaultValue = 'Text';

export default createComponent(Typography, {
  props: { children: { type: 'string', defaultValue } },
});
