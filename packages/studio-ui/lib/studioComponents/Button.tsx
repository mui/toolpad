import * as React from 'react';
import { Button as ButtonComponent, ButtonProps } from '@mui/material';
import type { StudioComponentDefinition } from '../types';

interface StudioButtonprops extends Omit<ButtonProps, 'children>'> {
  text: string;
}

function StudioButtonComponent({ text, ...props }: StudioButtonprops) {
  return <ButtonComponent {...props}>{text}</ButtonComponent>;
}

const defaultText = 'Button Text';

const Button: StudioComponentDefinition<StudioButtonprops> = {
  Component: React.memo(StudioButtonComponent),
  props: {
    text: { type: 'string', defaultValue: defaultText },
    disabled: { type: 'boolean', defaultValue: false },
    variant: {
      type: 'ButtonVariant',
      defaultValue: 'contained',
    },
  },
  render(context, node, resolvedProps) {
    context.addImport('@mui/material/Button', 'default', 'Button');
    const { text, ...other } = resolvedProps;
    return `
      <Button ${context.renderRootProps(node.id)} ${context.renderProps(other)}>
        {${text || '""'}}
      </Button>
    `;
  },
};

export default Button;
