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

  const { value: isDialogOpen, setTrue: openDialog, setFalse: closeDialog } = useBoolean(false);

  const value = page.attributes.parameters?.value;
  const [input, setInput] = React.useState(value);
  React.useEffect(() => {
    if (isDialogOpen) {
      setInput(value);
    }
  }, [isDialogOpen, value]);

  const handleSave = React.useCallback(() => {
    const updatedDom = appDom.setNodeNamespacedProp(
      dom,
      page,
      'attributes',
      'parameters',
      appDom.createConst(input || []),
    );
    domApi.update(updatedDom);
  }, [dom, page, input, domApi]);

  const { handleUndoRedoKeyDown } = useUndoRedo();
  useEventListener('keydown', handleUndoRedoKeyDown);

  const handleButtonClick = React.useCallback(() => {
    domApi.updateView({ kind: 'pageParameters', nodeId: pageNodeId });
  }, [domApi, pageNodeId]);

  const handleDialogClose = React.useCallback(() => {
    domApi.updateView({ kind: 'page' });
  }, [domApi]);

  React.useEffect(() => {
    if (viewInfo.kind === 'pageParameters') {
      openDialog();
    } else {
      closeDialog();
    }
  }, [closeDialog, handleDialogClose, openDialog, viewInfo]);

  return (
    <React.Fragment>
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleButtonClick}>
        Add page parameters
      </Button>
      <Dialog fullWidth open={isDialogOpen} onClose={handleDialogClose}>
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
