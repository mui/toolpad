import { SxProps, TextField } from '@mui/material';
import * as React from 'react';
import * as appDom from '../../appDom';
import { useDom, useDomApi } from '../DomLoader';

interface NodeNameEditorProps {
  node: appDom.AppDomNode;
  sx?: SxProps;
}

export default function NodeNameEditor({ node, sx }: NodeNameEditorProps) {
  const domApi = useDomApi();
  const dom = useDom();

  const [nameInput, setNameInput] = React.useState(node.name);
  React.useEffect(() => setNameInput(node.name), [node.name]);

  const handleNameInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value),
    [],
  );

  const isUnique = React.useMemo(() => {
    const disallowedNames = appDom.getExistingNames(dom, node);
    return !disallowedNames.has(nameInput);
  }, [dom, node, nameInput]);

  const handleNameCommit = React.useCallback(() => {
    if (isUnique) {
      domApi.setNodeName(node.id, nameInput);
    } else {
      setNameInput(node.name);
    }
  }, [isUnique, domApi, node.id, node.name, nameInput]);

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
      error={!isUnique}
      value={nameInput}
      onChange={handleNameInputChange}
      onBlur={handleNameCommit}
      onKeyPress={handleKeyPress}
    />
  );
}
