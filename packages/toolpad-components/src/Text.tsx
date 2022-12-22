import * as React from 'react';
import {
  Skeleton,
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
  Link as MuiLink,
  LinkProps as MuiLinkProps,
  styled,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

const ReactMarkdown = React.lazy(() => import('markdown-to-jsx'));

type BaseProps = MuiLinkProps | MuiTypographyProps;
interface TextProps extends Omit<BaseProps, 'children'> {
  mode: 'markdown' | 'link' | 'text';
  value: string;
  markdown: string;
  href?: string;
  loading?: boolean;
}

const MarkdownContainer = styled('div')({
  display: 'block',
  minHeight: '25px',
});

const CodeContainer = styled('pre')(({ theme }) => ({
  whiteSpace: 'pre-wrap',
  backgroundColor: theme.palette.grey[200],
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
}));

function Text({ value, markdown, href, loading, mode, sx, ...rest }: TextProps) {
  switch (mode) {
    case 'markdown':
      return loading ? (
        <Skeleton width={'100%'} sx={{ mx: 1 }} />
      ) : (
        <MarkdownContainer>
          <React.Suspense>
            <ReactMarkdown
              options={{
                overrides: {
                  a: {
                    component: MuiLink,
                    props: {
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    },
                  },
                  pre: {
                    component: CodeContainer,
                  },
                },
              }}
            >
              {value}
            </ReactMarkdown>
          </React.Suspense>
        </MarkdownContainer>
      );
    case 'link':
      return loading ? (
        <Skeleton width={150} />
      ) : (
        <MuiLink
          href={href}
          target="_blank"
          rel="noopener noreferrer"
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
    mode: {
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
      visible: ({ mode }) => mode === 'link',
    },
    variant: {
      typeDef: {
        type: 'string',
        enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      },
      label: 'Variant',
      visible: ({ mode }) => mode === 'text',
    },
    loading: {
      typeDef: { type: 'boolean' },
      defaultValue: false,
    },
    sx: {
      typeDef: { type: 'object' },
      visible: ({ mode }) => mode !== 'markdown',
    },
  },
});
