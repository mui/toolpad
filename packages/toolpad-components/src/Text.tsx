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
import { SX_PROP_HELPER_TEXT } from './constants';

const Markdown = React.lazy(() => import('markdown-to-jsx'));

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
  maxWidth: '100%',
  '&  p': {
    margin: '0',
  },
  '&:empty::before, & > span:empty::before': {
    content: '""',
    display: 'inline-block',
  },
});

const CodeContainer = styled('pre')(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  overflow: 'auto',
}));

function Text({ value, markdown, href, loading, mode, sx, ...rest }: TextProps) {
  switch (mode) {
    case 'markdown':
      return loading ? (
        <Skeleton width={'100%'} sx={{ mx: 1 }} />
      ) : (
        <MarkdownContainer>
          <React.Suspense>
            <Markdown
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
                slugify: () => '',
              }}
            >
              {value}
            </Markdown>
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
  helperText:
    'The Text component lets you display text. Text can be rendered in multiple forms: plain, as a link, or as markdown.',
  layoutDirection: 'both',
  loadingPropSource: ['value'],
  loadingProp: 'loading',
  argTypes: {
    mode: {
      helperText:
        'Defines how the content is rendered. Either as plain text, markdown, or as a link.',
      typeDef: { type: 'string', enum: ['text', 'markdown', 'link'], default: 'text' },
      label: 'Mode',
    },
    value: {
      helperText: 'The text content.',
      typeDef: { type: 'string', default: '' },
      label: 'Value',
      control: { type: 'markdown' },
    },
    href: {
      helperText: 'The url that is being linked.',
      typeDef: { type: 'string', default: 'about:blank' },
      visible: ({ mode }) => mode === 'link',
    },
    variant: {
      helperText:
        'The MUI typography [variant](https://mui.com/material-ui/customization/typography/#variants) that is used to display the text.',
      typeDef: {
        type: 'string',
        enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
        default: 'body1',
      },
      label: 'Variant',
      visible: ({ mode }) => mode === 'text',
    },
    loading: {
      helperText:
        'Displays a loading animation instead of the text. Can be used when the content is not available yet.',
      typeDef: { type: 'boolean', default: false },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
      visible: ({ mode }) => mode !== 'markdown',
    },
  },
});
