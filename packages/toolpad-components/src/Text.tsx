import * as React from 'react';
import {
  Skeleton,
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
  Link as MuiLink,
  LinkProps as MuiLinkProps,
  styled,
} from '@mui/material';
import { createComponent, TOOLPAD_COMPONENT_MODE_PROPERTY } from '@mui/toolpad-core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type BaseProps = MuiLinkProps | MuiTypographyProps;
interface TextProps extends Omit<BaseProps, 'children'> {
  [TOOLPAD_COMPONENT_MODE_PROPERTY]: string;
  value: string;
  markdown: string;
  href?: string;
  loading?: boolean;
}

const MarkdownContainer = styled('div')({
  display: 'block',
  '&:empty::before': { content: '""', display: 'inline-block' },
});

function Text({
  value,
  markdown,
  href,
  loading,
  [TOOLPAD_COMPONENT_MODE_PROPERTY]: mode,
  sx,
  ...rest
}: TextProps) {
  switch (mode) {
    case 'markdown':
      return loading ? (
        <Skeleton width={150} />
      ) : (
        <MarkdownContainer>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        </MarkdownContainer>
      );
    case 'link':
      return loading ? (
        <Skeleton width={150} />
      ) : (
        <MuiLink
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          sx={{
            minWidth: loading || !value ? 150 : undefined,
            // Same as Typography
            [`&:empty::before`]: { content: '""', display: 'inline-block' },
            ...sx,
          }}
        >
          {value}
        </MuiLink>
      );
    case 'text':
    default:
      return (
        <MuiTypography
          sx={{
            minWidth: loading || !value ? 150 : undefined,
            // This will give it height, even when empty.
            // REMARK: Does it make sense to put it in core?
            [`&:empty::before`]: { content: '""', display: 'inline-block' },
            ...sx,
          }}
          {...rest}
        >
          {loading ? <Skeleton /> : String(value)}
        </MuiTypography>
      );
  }
}

export default createComponent(Text, {
  layoutDirection: 'both',
  loadingPropSource: ['value'],
  loadingProp: 'loading',
  argTypes: {
    [TOOLPAD_COMPONENT_MODE_PROPERTY]: {
      typeDef: { type: 'string', enum: ['text', 'markdown', 'link'] },
      label: 'Mode',
      defaultValue: 'text',
    },
    value: {
      typeDef: { type: 'string' },
      label: 'Value',
      defaultValue: '',
      control: { type: 'markdown' },
    },
    href: {
      typeDef: { type: 'string' },
      defaultValue: 'about:blank',
      visible: ({ [TOOLPAD_COMPONENT_MODE_PROPERTY]: mode }) => mode === 'link',
    },
    variant: {
      typeDef: {
        type: 'string',
        enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      },
      label: 'Variant',
      visible: ({ [TOOLPAD_COMPONENT_MODE_PROPERTY]: mode }) => mode === 'text',
    },
    loading: {
      typeDef: { type: 'boolean' },
      defaultValue: false,
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
