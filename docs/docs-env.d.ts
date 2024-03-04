// Replace with
//   /// <reference path="@mui/internal-markdown"/>
// after https://github.com/mui/material-ui/pull/37240 gets merged.
/// <reference path="./modules.d.ts"/>

// Remove after https://github.com/mui/material-ui/pull/37240 gets merged.
declare module '@mui/monorepo/docs/src/modules/components/MarkdownDocs' {
  import * as React from 'react';

  declare const MarkdownDocs: React.ComponentType<any>;
  export default MarkdownDocs;
}
