import { Stack } from '@mui/material';
import withDefaultProps from './utils/addDefaultProps';

export default withDefaultProps(Stack, {
  gap: 2,
  direction: 'row',
  alignItems: 'start',
  justifyContent: 'start',
});
