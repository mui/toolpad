import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { createComponent } from '@mui/toolpad-core';

export type MarkdownProps = {
  markdown: string;
};

function Markdown({ markdown }: MarkdownProps) {
  return <ReactMarkdown linkTarget={'_blank'}>{markdown}</ReactMarkdown>;
}

export default createComponent(Markdown, {
  argTypes: {
    markdown: {
      typeDef: { type: 'string' },
      defaultValue: '###',
    },
  },
});
