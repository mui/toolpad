import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { NodeId } from '@mui/toolpad-core';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import MapEntriesEditor from '../../../components/MapEntriesEditor';
import useBoolean from '../../../utils/useBoolean';
import useUndoRedo from '../../hooks/useUndoRedo';
import useEventListener from '../../hooks/useEventListener';

export interface UrlQueryEditorProps {
  pageNodeId: NodeId;
}

export default function UrlQueryEditor({ pageNodeId }: UrlQueryEditorProps) {
  const { dom, viewInfo } = useDom();
  const domApi = useDomApi();

  const page = appDom.getNode(dom, pageNodeId, 'page');

  const {
    value: dialogOpen,
    setTrue: handleDialogOpen,
    setFalse: handleDialogClose,
  } = useBoolean(false);

  const value = page.attributes.parameters?.value;
  const [input, setInput] = React.useState(value);
  React.useEffect(() => {
    if (dialogOpen) {
      setInput(value);
    }
  }, [dialogOpen, value]);

  const handleSave = React.useCallback(() => {
    const updatedDom = appDom.setNodeNamespacedProp(
      dom,
      page,
      'attributes',
      'parameters',
      appDom.createConst(input || []),
    );
    domApi.update(updatedDom, { name: 'pageParameters', nodeId: pageNodeId });

    handleDialogClose();
  }, [dom, page, input, domApi, pageNodeId, handleDialogClose]);

  const { handleUndoRedoKeyDown } = useUndoRedo();
  useEventListener('keydown', handleUndoRedoKeyDown);

  React.useEffect(() => {
    if (viewInfo.name === 'pageParameters') {
      handleDialogOpen();
    } else {
      handleDialogClose();
    }
  }, [handleDialogClose, handleDialogOpen, viewInfo.name]);

  return (
    <React.Fragment>
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleDialogOpen}>
        Add page parameters
      </Button>
      <Dialog fullWidth open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit page parameters</DialogTitle>
        <DialogContent>
          <Typography>
            The parameters you define below will be made available in bindings under the{' '}
            <code>page.parameters</code> global variable. You can set these parameters in the url
            with query variables (<code>?param=value</code>).
          </Typography>
          <MapEntriesEditor
            sx={{ my: 3 }}
            fieldLabel="Parameter"
            valueLabel="Default value"
            value={input || []}
            onChange={setInput}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={handleDialogClose}>
            Close
          </Button>
          <Button disabled={value === input} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
