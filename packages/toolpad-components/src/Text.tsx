import * as React from 'react';
import {
  Skeleton,
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
  Link as MuiLink,
  LinkProps as MuiLinkProps,
  styled,
  TextareaAutosize,
} from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants.js';

const Markdown = React.lazy(async () => import('markdown-to-jsx'));

const StyledTextareaAutosize = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  resize: 'none',
  border: 'none',
  outline: 'none',
  padding: 0,

  ...Object.fromEntries(
    Object.keys(theme.typography).map((variant) => [
      [`&.variant-${variant}`],
      theme.typography[variant as keyof typeof theme.typography],
    ]),
  ),
}));

type BaseProps = MuiLinkProps | MuiTypographyProps;
interface TextProps extends Omit<BaseProps, 'children'> {
  mode: 'markdown' | 'link' | 'text';
  value: string;
  markdown: string;
  href?: string;
  loading?: boolean;
}

const MarkdownContainer = styled('div')(({ theme }) => ({
  display: 'block',
  maxWidth: '100%',
  '&:empty::before, & > span:empty::before': {
    content: '""',
    display: 'inline-block',
  },
  '& h1': {
    ...theme.typography.h1,
    marginTop: 16,
    marginBottom: 16,
  },
  '& h2': {
    ...theme.typography.h2,
    marginTop: 12,
    marginBottom: 12,
  },
  '& h3': {
    ...theme.typography.h3,
    marginTop: 12,
    marginBottom: 12,
  },
  '& h4': {
    ...theme.typography.h4,
    marginTop: 12,
    marginBottom: 12,
  },
  '& h5': {
    ...theme.typography.h5,
    marginTop: 4,
    marginBottom: 4,
  },
  '& h6': {
    ...theme.typography.h6,
    marginTop: 4,
    marginBottom: 4,
  },
  '& p': {
    marginTop: 12,
    marginBottom: 12,
  },
  '& *:first-child': {
    marginTop: 0,
  },
  '& *:last-child': {
    marginBottom: 0,
  },
}));

const CodeContainer = styled('pre')(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  overflow: 'auto',
}));

function parseInput(text: unknown): string {
  return String(text).replaceAll('\n', '');
}

function Text({ value, markdown, href, loading, mode, sx, ...rest }: TextProps) {
  const [contentEditable, setContentEditable] = React.useState<null | {
    selectionStart: number;
    selectionEnd: number;
  }>(null);
  const [input, setInput] = React.useState<string>(parseInput(value));
  React.useEffect(() => {
    setInput(parseInput(value));
  }, [value]);

  const nodeRuntime = useNode<TextProps>();

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
            overflowWrap: 'anywhere',
            ...sx,
          }}
        >
          {value}
        </MuiLink>
      );
    case 'text':
    default:
      return contentEditable ? (
        <StyledTextareaAutosize
          value={input}
          onChange={(event) => {
            setInput(parseInput(event.target.value));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          autoFocus
          onFocus={(event) => {
            event.currentTarget.selectionStart = contentEditable.selectionStart;
            event.currentTarget.selectionEnd = Math.max(
              contentEditable.selectionStart,
              contentEditable.selectionEnd,
            );
          }}
          onBlur={() => {
            setContentEditable(null);
            if (nodeRuntime) {
              nodeRuntime.updateAppDomConstProp('value', input);
            }
          }}
          className={`variant-${rest.variant}`}
        />
      ) : (
        <MuiTypography
          sx={{
            ...sx,
            width: '100%',
            // This will give it height, even when empty.
            // REMARK: Does it make sense to put it in MUI core?
            [`&:empty::before`]: { content: '""', display: 'inline-block' },
            outline: 'none',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
          }}
          onDoubleClick={() => {
            if (nodeRuntime) {
              const selection = window.getSelection();
              setContentEditable({
                selectionStart: selection?.anchorOffset || 0,
                selectionEnd: selection?.focusOffset || 0,
              });
            }
          }}
          {...rest}
        >
          {loading ? <Skeleton /> : input}
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
      type: 'string',
      enum: ['text', 'markdown', 'link'],
      default: 'text',
      label: 'Mode',
    },
    value: {
      helperText: 'The text content.',
      type: 'string',
      default: 'text',
      label: 'Value',
      control: { type: 'markdown' },
    },
    href: {
      helperText: 'The url that is being linked.',
      type: 'string',
      default: 'about:blank',
      visible: ({ mode }) => mode === 'link',
    },
    variant: {
      helperText:
        'The MUI typography [variant](https://mui.com/material-ui/customization/typography/#variants) that is used to display the text.',
      type: 'string',
      enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      default: 'body1',
      label: 'Variant',
      visible: ({ mode }) => mode === 'text',
    },
    loading: {
      helperText:
        'Displays a loading animation instead of the text. Can be used when the content is not available yet.',
      type: 'boolean',
      default: false,
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
      visible: ({ mode }) => mode !== 'markdown',
    },
  },
});
