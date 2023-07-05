import * as React from 'react';
import MarkdownDocs from '@mui/monorepo-docs/src/modules/components/MarkdownDocs';
import * as pageProps from '../../../../examples/admin-app/README.md?@mui/markdown';

export default function Page() {
  return <MarkdownDocs disableAd {...pageProps} />;
}
