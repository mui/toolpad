import { TextField } from '@mui/material';
import * as React from 'react';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { useDomApi } from '../AppState';

interface PageTitleEditorProps {
  node: appDom.PageNode;
}

function validateInput(input: string) {
  if (!input) {
    return 'Input required';
  }
  return null;
}

export default function PageTitleEditor({ node }: PageTitleEditorProps) {
  const domApi = useDomApi();
  const [pageTitleInput, setPageTitleInput] = React.useState(appDom.getPageTitle(node));

  const handlePageTitleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setPageTitleInput(event.target.value),
    [],
  );

  const handleCommit = React.useCallback(() => {
    domApi.update((dom: appDom.AppDom) =>
      appDom.setNodeNamespacedProp(dom, node, 'attributes', 'title', pageTitleInput),
    );
  }, [node, pageTitleInput, domApi]);

  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.code === 'Enter') {
        handleCommit();
      }
    },
    [handleCommit],
  );

  return (
    <TextField
      fullWidth
      label="Page title"
      value={pageTitleInput}
      onChange={handlePageTitleChange}
      onBlur={handleCommit}
      onKeyDown={handleKeyPress}
      error={!pageTitleInput}
      helperText={validateInput(pageTitleInput)}
    />
  );
}
