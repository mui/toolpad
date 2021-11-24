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
  render(context, node) {
    context.addImport('@mui/material/Button', 'default', 'Button');
    const otherProps = Object.keys(node.props).filter((prop) => prop !== 'text');
    return `
      <Button ${context.renderRootprops(node.id)} ${context.renderProps(node.id, otherProps)}>
        ${context.renderPropValue(node.id, 'text') || ''}
      </Button>
    `;
  },
};

export default Button;
