import { Tooltip, Link as MuiLink, TooltipProps } from '@mui/material';
import Markdown from 'markdown-to-jsx';
import * as React from 'react';

export interface MarkdownTooltipProps extends TooltipProps {
  title: string;
  children: React.ReactElement<any, any>;
}

export default function MarkdownTooltip({ title, children, ...props }: MarkdownTooltipProps) {
  const renderedTitle: React.ReactNode = React.useMemo(
    () =>
      title ? (
        <Markdown
          options={{
            overrides: {
              a: {
                component: MuiLink,
                props: {
                  target: '_blank',
                },
              },
            },
          }}
        >
          {title}
        </Markdown>
      ) : null,
    [title],
  );
  return (
    <Tooltip title={renderedTitle} {...props}>
      {children}
    </Tooltip>
  );
}
