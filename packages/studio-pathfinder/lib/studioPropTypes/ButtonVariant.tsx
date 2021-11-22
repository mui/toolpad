import { ButtonProps } from '@mui/material';
import { PropTypeDefinition } from '../types';
import { createSelectEditor } from './selectEditor';

type ButtonVariantType = NonNullable<ButtonProps['variant']>;

const ButtonVariant: PropTypeDefinition<ButtonVariantType> = {
  Editor: createSelectEditor(['text', 'contained', 'outlined']),
};

export default ButtonVariant;
