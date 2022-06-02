import { SxProps, TextField } from '@mui/material';
import * as React from 'react';
import * as appDom from '../../appDom';
import { useDomApi } from '../DomLoader';

interface NodeNameEditorProps {
  node: appDom.AppDomNode;
  sx?: SxProps;
}

export default function NodeNameEditor({ node, sx }: NodeNameEditorProps) {
  const domApi = useDomApi();

  const [nameInput, setNameInput] = React.useState(node.name);
  React.useEffect(() => setNameInput(node.name), [node.name]);

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
      sx={sx}
      fullWidth
      label="name"
      value={nameInput}
      onChange={handleNameInputChange}
      onBlur={handleNameCommit}
      onKeyPress={handleKeyPress}
    />
  );
}
