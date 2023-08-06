import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from '../../../data/toolpad/live-config/index.md?@mui/markdown';

React.x ??= 2;
console.log('2', React.x);

export default function Page() {
  return <MarkdownDocs disableAd {...pageProps} />;
}
