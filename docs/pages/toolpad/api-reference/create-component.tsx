import * as React from 'react';
import MarkdownDocs from '@mui/monorepo/docs/src/modules/components/MarkdownDocs';
import * as pageProps from '../../../data/toolpad/api-reference/create-component.md?@mui/markdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
