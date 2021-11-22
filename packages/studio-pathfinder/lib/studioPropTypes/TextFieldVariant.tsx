import { TextFieldProps } from '@mui/material';
import { PropTypeDefinition } from '../types';
import { createSelectEditor } from './selectEditor';

type TextFieldVariantType = NonNullable<TextFieldProps['variant']>;

const textFieldVariant: PropTypeDefinition<TextFieldVariantType> = {
  Editor: createSelectEditor(['outlined', 'filled', 'standard']),
};

export default textFieldVariant;
