import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
<<<<<<<< HEAD:docs/pages/toolpad/concepts/data-binding.js
import * as pageProps from '../../../data/toolpad/concepts/data-binding.md?@mui/markdown';
========
import * as pageProps from '../../../data/toolpad/concepts/custom-server.md?@mui/markdown';
>>>>>>>> master:docs/pages/toolpad/concepts/custom-server.js

export default function Page() {
  return <MarkdownDocs disableAd {...pageProps} />;
}
