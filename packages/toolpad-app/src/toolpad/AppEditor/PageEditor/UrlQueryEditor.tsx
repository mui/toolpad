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
import { useDom, useDomApi, useAppState, useAppStateApi } from '../../AppState';
import MapEntriesEditor from '../../../components/MapEntriesEditor';
import useBoolean from '../../../utils/useBoolean';

export interface UrlQueryEditorProps {
  pageNodeId: NodeId;
}

export default function UrlQueryEditor({ pageNodeId }: UrlQueryEditorProps) {
  const { dom } = useDom();
  const { currentView } = useAppState();

  const domApi = useDomApi();
  const appStateApi = useAppStateApi();

  const page = appDom.getNode(dom, pageNodeId, 'page');

  const { value: isDialogOpen, setTrue: openDialog, setFalse: closeDialog } = useBoolean(false);

  const value = page.attributes.parameters?.value;

  const [input, setInput] = React.useState(value);

  const hasUnsavedChanges = input !== value;

  React.useEffect(() => {
    if (isDialogOpen) {
      setInput(value);
    }
  }, [isDialogOpen, value]);

  const handleButtonClick = React.useCallback(() => {
    appStateApi.setView({
      kind: 'page',
      nodeId: pageNodeId,
      view: { kind: 'pageParameters' },
    });
  }, [appStateApi, pageNodeId]);

  const handleDialogClose = React.useCallback(
    (skipUnsavedChangesCheck: boolean) => () => {
      if (hasUnsavedChanges && !skipUnsavedChangesCheck) {
        // eslint-disable-next-line no-alert
        const ok = window.confirm(
          'You have unsaved changes. Are you sure you want to navigate away?\nAll changes will be discarded.',
        );

        if (!ok) {
          return;
        }
      }

      appStateApi.setView({ kind: 'page', nodeId: pageNodeId });
    },
    [appStateApi, hasUnsavedChanges, pageNodeId],
  );

  const handleDialogCloseWithoutCheck = React.useMemo(
    () => handleDialogClose(true),
    [handleDialogClose],
  );
  const handleDialogCloseWithCheck = React.useMemo(
    () => handleDialogClose(false),
    [handleDialogClose],
  );

  const handleSave = React.useCallback(() => {
    domApi.update((draft) =>
      appDom.setNodeNamespacedProp(
        draft,
        page,
        'attributes',
        'parameters',
        appDom.createConst(input || []),
      ),
    );
    handleDialogCloseWithoutCheck();
  }, [domApi, handleDialogCloseWithoutCheck, input, page]);

  React.useEffect(() => {
    if (currentView.kind === 'page' && currentView.view?.kind === 'pageParameters') {
      openDialog();
    } else {
      closeDialog();
    }
  }, [closeDialog, currentView, openDialog]);

  return (
    <React.Fragment>
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleButtonClick}>
        Add page parameters
      </Button>
      <Dialog fullWidth open={isDialogOpen} onClose={handleDialogCloseWithCheck}>
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
          <Button color="inherit" variant="text" onClick={handleDialogCloseWithCheck}>
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
