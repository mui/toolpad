import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
<<<<<<<< HEAD:docs/pages/toolpad/core/components/data-provider.js
import * as pageProps from '../../../../data/toolpad/core/components/data-provider.md?muiMarkdown';
========
import * as pageProps from '../../../../data/toolpad/core/components/dashboard-layout/dashboard-layout.md?muiMarkdown';
>>>>>>>> upstream/master:docs/pages/toolpad/core/components/dashboard-layout.js

export default function Page() {
  return <MarkdownDocs disableAd {...pageProps} />;
}
