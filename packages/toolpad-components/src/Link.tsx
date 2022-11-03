import * as React from 'react';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

interface LinkProps extends Omit<MuiLinkProps, 'children'> {
  href: string;
  value: string;
}

function Link({ value, href }: LinkProps) {
  return (
    <MuiLink href={href} target="_blank" rel="noopener noreferrer nofollow">
      {value}
    </MuiLink>
  );
}

export default createComponent(Link, {
  argTypes: {
    value: {
      typeDef: { type: 'string' },
      defaultValue: 'Link',
    },
    href: {
      typeDef: { type: 'string' },
      defaultValue: 'about:blank',
    },
  },
});
