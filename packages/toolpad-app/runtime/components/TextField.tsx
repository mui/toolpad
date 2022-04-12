import { TextField } from '@mui/material';
import withDefaultProps from '../utils/addDefaultProps';

export default withDefaultProps(TextField, {
  variant: 'outlined',
  size: 'small',
  value: '',
});
