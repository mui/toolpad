import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Link,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { NodeId } from '@mui/toolpad-core';
import * as appDom from '../../../appDom';
import { useDom, useDomApi, useAppState, useAppStateApi } from '../../AppState';
import MapEntriesEditor from '../../../components/MapEntriesEditor';
import useBoolean from '../../../utils/useBoolean';
import useUnsavedChangesConfirm from '../../hooks/useUnsavedChangesConfirm';

export interface UrlQueryEditorProps {
  pageNodeId: NodeId;
}

interface UrlQueryStringProps {
  input: [string, string][] | undefined;
}

function UrlQueryString({ input }: UrlQueryStringProps) {
  const [queryString, setQueryString] = React.useState('');

  const createQueryString = React.useCallback(() => {
    return input?.reduce(
      (accumulator, fieldAndValue: string[], currentIndex: number) => {
        const [field, value] = fieldAndValue;
        return `${accumulator}${currentIndex > 0 ? '&' : ''}${field}=${value}`;
      },
      input.length ? '?' : '',
    );
  }, [input]);

  React.useEffect(() => {
    setQueryString(createQueryString() as string);
  }, [createQueryString, input]);

  return (
    <Typography
      sx={{
        marginTop: '20px',
      }}
    >
      <code>{queryString}</code>
    </Typography>
  );
}

export default function UrlQueryEditor({ pageNodeId }: UrlQueryEditorProps) {
  const { dom } = useDom();
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
      kind: 'page',
      nodeId: pageNodeId,
      view: { kind: 'pageParameters' },
    });
  }, [appStateApi, pageNodeId]);

  const handleDialogClose = React.useCallback(() => {
    appStateApi.setView({ kind: 'page', nodeId: pageNodeId });
  }, [appStateApi, pageNodeId]);

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
      <Dialog fullWidth open={isDialogOpen} onClose={handleCloseWithUnsavedChanges}>
        <DialogTitle>Edit page parameters</DialogTitle>
        <DialogContent>
          <Typography>
            Page parameters allow you to pass external data into the Toolpad page state via the URL
            query. Read more in the{' '}
            <Link href="https://mui.com/toolpad/concepts/managing-state/#page-parameters">
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
    </React.Fragment>
  );
}
