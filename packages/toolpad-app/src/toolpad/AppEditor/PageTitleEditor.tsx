import { TextField } from '@mui/material';
import * as React from 'react';
import { AppDom, PageNode, setNodeNamespacedProp } from '../../appDom';
import { useDomApi } from '../AppState';

interface PageTitleEditorProps {
  node: PageNode;
}

function validateInput(input: string) {
  if (!input) {
    return 'Input required';
  }
  return null;
}

export default function PageTitleEditor({ node }: PageTitleEditorProps) {
  const domApi = useDomApi();
  const [pageTitleInput, setPageTitleInput] = React.useState(node.attributes.title || node.name);

  const handlePageTitleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setPageTitleInput(event.target.value),
    [],
  );

  const handleCommit = React.useCallback(() => {
    domApi.update((appDom: AppDom) =>
      setNodeNamespacedProp(appDom, node, 'attributes', 'title', pageTitleInput),
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
