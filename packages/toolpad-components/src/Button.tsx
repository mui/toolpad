import { Button } from '@mui/material';
import withDefaultProps from './utils/addDefaultProps';

export default withDefaultProps(Button, {
  children: 'Button Text',
  variant: 'contained',
  color: 'primary',
});
