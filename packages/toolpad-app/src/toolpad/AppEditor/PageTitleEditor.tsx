import { TextField } from '@mui/material';
import * as React from 'react';
import { AppDom, PageNode } from '../../appDom';
import { useDomApi } from '../AppState';
import { update } from '../../utils/immutability';

interface PageTitleEditorProps {
  node: PageNode;
}

export default function PageTitleEditor({ node }: PageTitleEditorProps) {
  const domApi = useDomApi();
  const [pageTitleInput, setPageTitleInput] = React.useState(node.attributes.title);
  const [isValid, setIsValid] = React.useState(true);

  const handlePageTitleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setPageTitleInput(event.target.value),
    [],
  );

  const handleCommit = React.useCallback(() => {
    if (!isValid) {
      return;
    }
    domApi.update((appDom: AppDom) => {
      return update(appDom, {
        nodes: update(appDom.nodes, {
          [node.id]: {
            ...node,
            attributes: { ...node.attributes, title: pageTitleInput },
          },
        }),
      });
    });
  }, [domApi, node, pageTitleInput, isValid]);

  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.code === 'Enter') {
        handleCommit();
      }
    },
    [handleCommit],
  );

  React.useEffect(() => {
    if (!pageTitleInput) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }, [pageTitleInput]);

  return (
    <TextField
      fullWidth
      label="Page title"
      value={pageTitleInput}
      onChange={handlePageTitleChange}
      onBlur={handleCommit}
      onKeyDown={handleKeyPress}
      error={!isValid}
      helperText={!isValid && 'Title cannot be empty'}
    />
  );
}
