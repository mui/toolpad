import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from '../../../../data/toolpad/core/integrations/nextjs-pagesrouter.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs disableAd {...pageProps} />;
}
