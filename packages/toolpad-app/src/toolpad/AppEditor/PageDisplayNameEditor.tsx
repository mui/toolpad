import { TextField } from '@mui/material';
import * as React from 'react';
import { AppDom, PageNode, setNodeProp } from '../../appDom';
import { useDomApi } from '../AppState';

interface PageDisplayNameEditorProps {
  node: PageNode;
}

function validateInput(input: string) {
  if (!input) {
    return 'Input required';
  }
  return null;
}

export default function PageDisplayNameEditor({ node }: PageDisplayNameEditorProps) {
  const domApi = useDomApi();
  const [pageDisplayNameInput, setPageDisplayNameInput] = React.useState(
    node.displayName ?? node.name,
  );

  const handlePageDisplayNameChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setPageDisplayNameInput(event.target.value),
    [],
  );

  const handleCommit = React.useCallback(() => {
    domApi.update((appDom: AppDom) =>
      setNodeProp(appDom, node, 'displayName', pageDisplayNameInput),
    );
  }, [node, pageDisplayNameInput, domApi]);

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
      label="Page display name"
      value={pageDisplayNameInput}
      onChange={handlePageDisplayNameChange}
      onBlur={handleCommit}
      onKeyDown={handleKeyPress}
      error={!pageDisplayNameInput}
      helperText={validateInput(pageDisplayNameInput)}
    />
  );
}
