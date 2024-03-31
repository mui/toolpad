import { SxProps, TextField } from '@mui/material';
import * as React from 'react';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { useAppState, useDomApi } from '../AppState';
import { useNodeNameValidation } from './PagesExplorer/validation';
import { useProjectApi } from '../../projectApi';

interface NodeNameEditorProps {
  node: appDom.AppDomNode;
  sx?: SxProps;
}

export default function NodeNameEditor({ node, sx }: NodeNameEditorProps) {
  const domApi = useDomApi();
  const { dom } = useAppState();
  const projectApi = useProjectApi();

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
    const oldname = dom.nodes[node.id];
    if (isNameValid && oldname.type === 'page' && nameInput !== oldname.name) {
      setTimeout(async () => {
        await projectApi.methods.deletePage(oldname.name);
      }, 300);
    }
  }, [projectApi, isNameValid, domApi, node.id, node.name, nameInput, dom]);

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
