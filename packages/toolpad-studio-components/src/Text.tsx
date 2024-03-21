import * as React from 'react';
import {
  Skeleton,
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
  Link as MuiLink,
  styled,
  TextareaAutosize,
  SxProps,
} from '@mui/material';
import { useNode } from '@toolpad/studio-runtime';
import ErrorIcon from '@mui/icons-material/Error';
import { errorFrom } from '@toolpad/utils/errors';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';

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

interface TextProps {
  mode: 'markdown' | 'link' | 'text';
  value: string;
  markdown: string;
  href?: string;
  openInNewTab?: boolean;
  loading?: boolean;
  error?: unknown;
  sx?: SxProps;
  variant: MuiTypographyProps['variant'];
}

const MarkdownContainer = styled('div')(({ theme }) => ({
  display: 'block',
  overflowWrap: 'anywhere',
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

interface ErrorDisplayProps {
  error: unknown;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
  const errMessage = errorFrom(error).message;
  return (
    <MuiTypography sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
      <ErrorIcon fontSize="small" color="error" />
      <span>{errMessage}</span>
    </MuiTypography>
  );
}

interface LinkContentProps {
  value: string;
  href?: string;
  loading?: boolean;
  openInNewTab?: boolean;
  sx?: SxProps;
}

function LinkContent({ value, href, loading, sx, openInNewTab }: LinkContentProps) {
  const content = React.useMemo(() => {
    if (loading) {
      return <Skeleton variant="text" />;
    }
    return value;
  }, [value, loading]);

  return (
    <MuiLink
      href={href}
      target={openInNewTab ? '_blank' : undefined}
      rel="noopener"
      sx={{
        minWidth: loading || !value ? 150 : undefined,
        // Same as Typography
        [`&:empty::before`]: { content: '""', display: 'inline-block' },
        overflowWrap: 'anywhere',
        ...sx,
      }}
    >
      {content}
    </MuiLink>
  );
}

interface MarkdownContentProps {
  value: string;
  loading?: boolean;
  sx?: SxProps;
}

function MarkdownContent({ value, loading, sx }: MarkdownContentProps) {
  const loadingFallback = <Skeleton variant="text" width={'100%'} />;

  return (
    <MarkdownContainer sx={sx}>
      {loading ? (
        loadingFallback
      ) : (
        <React.Suspense fallback={loadingFallback}>
          <Markdown
            options={{
              overrides: {
                a: {
                  component: MuiLink,
                  props: {
                    target: '_blank',
                    rel: 'noopener',
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
      )}
    </MarkdownContainer>
  );
}

interface TextContentProps {
  value: string;
  loading?: boolean;
  sx?: SxProps;
  variant: MuiTypographyProps['variant'];
}

function TextContent({ value, loading, sx, variant }: TextContentProps) {
  const [contentEditable, setContentEditable] = React.useState<null | {
    selectionStart: number;
    selectionEnd: number;
  }>(null);
  const [input, setInput] = React.useState<string>(parseInput(value));
  React.useEffect(() => {
    setInput(parseInput(value));
  }, [value]);

  const nodeRuntime = useNode<TextProps>();

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
      className={`variant-${variant}`}
    />
  ) : (
    <MuiTypography
      sx={{
        ...sx,
        // This will give it height, even when empty.
        // REMARK: Does it make sense to put it in MUI core?
        [`&:empty::before`]: { content: '""', display: 'inline-block' },
        outline: 'none',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
      variant={variant}
      onDoubleClick={() => {
        if (nodeRuntime) {
          const selection = window.getSelection();
          setContentEditable({
            selectionStart: selection?.anchorOffset || 0,
            selectionEnd: selection?.focusOffset || 0,
          });
        }
      }}
    >
      {loading ? <Skeleton variant="text" /> : input}
    </MuiTypography>
  );
}

function Text(props: TextProps) {
  if (props.error) {
    return <ErrorDisplay error={props.error} />;
  }
  switch (props.mode) {
    case 'markdown':
      return <MarkdownContent {...props} />;
    case 'link':
      return <LinkContent {...props} />;
    case 'text':
    default:
      return <TextContent {...props} />;
  }
}

export default createBuiltin(Text, {
  helperText:
    "The Text component lets you display text. Text can be rendered in multiple forms: plain, as a link, or as markdown. It's rendered using Material UI [Typography](https://mui.com/material-ui/react-typography/).",
  layoutDirection: 'both',
  loadingPropSource: ['value'],
  loadingProp: 'loading',
  errorPropSource: ['value'],
  errorProp: 'error',
  argTypes: {
    mode: {
      helperText:
        'Defines how the content is rendered. Either as plain text, markdown, or as a link.',
      type: 'string',
      enum: ['text', 'markdown', 'link'],
      enumLabels: {
        text: 'Text',
        markdown: 'Markdown',
        link: 'Link',
      },
      default: 'text',
      label: 'Mode',
      control: { type: 'ToggleButtons' },
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
      visible: ({ mode }: TextProps) => mode === 'link',
    },
    openInNewTab: {
      label: 'Open in a new tab',
      helperText: 'Clicking the link should open a new tab.',
      type: 'boolean',
      default: false,
      visible: ({ mode }: TextProps) => mode === 'link',
    },
    variant: {
      helperText:
        'The Material UI typography [variant](https://mui.com/material-ui/customization/typography/#variants) that is used to display the text.',
      type: 'string',
      enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      default: 'body1',
      label: 'Variant',
      visible: ({ mode }: TextProps) => mode === 'text',
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
      visible: ({ mode }: TextProps) => mode !== 'markdown',
    },
  },
});
