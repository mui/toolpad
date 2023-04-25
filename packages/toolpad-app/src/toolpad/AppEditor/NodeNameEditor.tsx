import { SxProps, TextField } from '@mui/material';
import * as React from 'react';
import * as appDom from '../../appDom';
import { useDom, useDomApi } from '../AppState';
import { useNodeNameValidation } from './HierarchyExplorer/validation';

interface NodeNameEditorProps {
  node: appDom.AppDomNode;
  sx?: SxProps;
}

export default function NodeNameEditor({ node, sx }: NodeNameEditorProps) {
  const domApi = useDomApi();
  const { dom } = useDom();

  const [nameInput, setNameInput] = React.useState(node.name);
  React.useEffect(() => setNameInput(node.name), [node.name]);

  const handleNameInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value),
    [],
  );

  const existingNames = React.useMemo(() => appDom.getExistingNamesForNode(dom, node), [dom, node]);
  const nodeNameError = useNodeNameValidation(nameInput, existingNames, node.type);
  const isNameValid = !nodeNameError;

  const handleNameCommit = React.useCallback(() => {
    if (isNameValid) {
      domApi.setNodeName(node.id, nameInput);
    } else {
      setNameInput(node.name);
    }
  }, [isNameValid, domApi, node.id, node.name, nameInput]);

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
      label="Node name"
      error={!isNameValid}
      helperText={nodeNameError}
      value={nameInput}
      onChange={handleNameInputChange}
      onBlur={handleNameCommit}
      onKeyPress={handleKeyPress}
    />
  );
}
