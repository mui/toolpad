import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { NodeId } from '@toolpad/studio-runtime';
import useBoolean from '@toolpad/utils/hooks/useBoolean';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { useAppState, useDomApi, useAppStateApi } from '../../AppState';
import MapEntriesEditor from '../../../components/MapEntriesEditor';
import useUnsavedChangesConfirm from '../../hooks/useUnsavedChangesConfirm';

export interface UrlQueryEditorProps {
  pageNodeId: NodeId;
}

interface UrlQueryStringProps {
  input: [string, string][] | undefined;
}

function UrlQueryString({ input }: UrlQueryStringProps) {
  const queryString = React.useMemo(() => {
    const search = new URLSearchParams(input).toString();
    return search.length ? search : '';
  }, [input]);

  return (
    <React.Fragment>
      <Divider variant="middle" sx={{ alignSelf: 'stretch', marginTop: '20px' }} />
      <Typography variant="overline">Usage Preview:</Typography>
      <Typography>
        <code>{queryString}</code>
      </Typography>
    </React.Fragment>
  );
}

export default function UrlQueryEditor({ pageNodeId }: UrlQueryEditorProps) {
  const { dom } = useAppState();
  const { currentView } = useAppState();

  const domApi = useDomApi();
  const appStateApi = useAppStateApi();

  const page = appDom.getNode(dom, pageNodeId, 'page');

  const { value: isDialogOpen, setTrue: openDialog, setFalse: closeDialog } = useBoolean(false);

  const value = page.attributes.parameters;

  const [input, setInput] = React.useState(value);

  const hasUnsavedChanges = input !== value;

  React.useEffect(() => {
    if (isDialogOpen) {
      setInput(value);
    }
  }, [isDialogOpen, value]);

  const handleButtonClick = React.useCallback(() => {
    appStateApi.setView({
      ...currentView,
      kind: 'page',
      name: page.name,
      pageParametersDialogOpen: true,
    });
  }, [appStateApi, page.name, currentView]);

  const handleDialogClose = React.useCallback(() => {
    appStateApi.setView({
      ...currentView,
      kind: 'page',
      name: page.name,
      pageParametersDialogOpen: false,
    });
  }, [appStateApi, page.name, currentView]);

  const { handleCloseWithUnsavedChanges } = useUnsavedChangesConfirm({
    hasUnsavedChanges,
    onClose: handleDialogClose,
  });

  const handleSave = React.useCallback(() => {
    domApi.update((draft) =>
      appDom.setNodeNamespacedProp(draft, page, 'attributes', 'parameters', input || []),
    );
    handleDialogClose();
  }, [domApi, handleDialogClose, input, page]);

  React.useEffect(() => {
    if (currentView.kind === 'page' && currentView.pageParametersDialogOpen) {
      openDialog();
    } else {
      closeDialog();
    }
  }, [closeDialog, currentView, openDialog]);

  return (
    <div>
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleButtonClick}>
        Add page parameters
      </Button>
      <Dialog fullWidth open={isDialogOpen} onClose={handleCloseWithUnsavedChanges}>
        <DialogTitle>Edit page parameters</DialogTitle>
        <DialogContent>
          <Typography>
            Page parameters allow you to pass external data into the Toolpad Studio page state via
            the URL query. Read more in the{' '}
            <Link
              href="https://mui.com/toolpad/studio/concepts/page-properties/#page-parameters"
              target="_blank"
              rel="noopener"
            >
              docs
            </Link>
            .
          </Typography>
          <UrlQueryString input={input} />
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
    </div>
  );
}
