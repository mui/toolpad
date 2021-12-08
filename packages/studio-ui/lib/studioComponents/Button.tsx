import { ButtonProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';

interface StudioButtonprops extends ButtonProps {
  children: string;
}

const defaultText = 'Button Text';

const Button: StudioComponentDefinition<StudioButtonprops> = {
  props: {
    children: { type: 'string', defaultValue: defaultText },
    disabled: { type: 'boolean', defaultValue: false },
    variant: {
      type: 'ButtonVariant',
      defaultValue: 'contained',
    },
  },
  module: '@mui/studio-components',
  importedName: 'Button',
};

export default Button;
