import { TextField } from '@mui/material';
import * as React from 'react';
import * as studioDom from '../../../studioDom';
import { useDomApi } from '../../DomLoader';

interface NodeNameEditorProps {
  node: studioDom.StudioNode;
}

export default function NodeNameEditor({ node }: NodeNameEditorProps) {
  const domApi = useDomApi();

  const [nameInput, setNameInput] = React.useState(node.name);

  const handleNameInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value),
    [],
  );

  const handleNameCommit = React.useCallback(
    () => domApi.setNodeName(node.id, nameInput),
    [domApi, node.id, nameInput],
  );

  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        handleNameCommit();
      }
    },
    [handleNameCommit],
  );

  return (
    <TextField
      fullWidth
      size="small"
      label="name"
      value={nameInput}
      onChange={handleNameInputChange}
      onBlur={handleNameCommit}
      onKeyPress={handleKeyPress}
    />
  );
}
