import { ButtonProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';

interface StudioButtonprops extends Omit<ButtonProps, 'children>'> {
  text: string;
}

const defaultText = 'Button Text';

const Button: StudioComponentDefinition<StudioButtonprops> = {
  props: {
    text: { type: 'string', defaultValue: defaultText },
    disabled: { type: 'boolean', defaultValue: false },
    variant: {
      type: 'ButtonVariant',
      defaultValue: 'contained',
    },
  },
  render(context, node, resolvedProps) {
    context.addImport('@mui/material', 'Button', 'Button');
    const { text, ...other } = resolvedProps;
    return `
      <Button ${context.renderProps(other)}>
        {${text || '""'}}
      </Button>
    `;
  },
};

export default Button;
