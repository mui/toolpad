import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
<<<<<<<< HEAD:docs/pages/toolpad/authentication.js
import * as pageProps from '../../data/toolpad/authentication.md?muiMarkdown';
========
import * as pageProps from '../../../data/toolpad/components/data-grid/data-grid.md?muiMarkdown';
>>>>>>>> 7b71a4a53e369dd7a3caef2b9ab74cbafeede638:docs/pages/toolpad/data-grid.js

export default function Page() {
  return <MarkdownDocs disableAd {...pageProps} />;
}
