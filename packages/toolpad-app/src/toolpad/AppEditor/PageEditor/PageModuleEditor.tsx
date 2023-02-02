import CodeIcon from '@mui/icons-material/Code';
import { Box, Button, Dialog, DialogActions, DialogTitle, Skeleton } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import * as React from 'react';
import { useDom, useDomApi, useAppState, useAppStateApi } from '../../AppState';
import * as appDom from '../../../appDom';
import { tryFormat } from '../../../utils/prettier';
import useShortcut from '../../../utils/useShortcut';
import lazyComponent from '../../../utils/lazyComponent';

const TypescriptEditor = lazyComponent(() => import('../../../components/TypescriptEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

const DEFAULT_CONTENT = `// All properties of this object will be available on the global scope in bindings
export const globalScope = {};
`;

const EXTRA_LIBS_HTTP_MODULES = [
  {
    content: `declare module "https://*";`,
  },
];

interface PageModuleEditorDialogProps {
  pageNodeId: NodeId;
  open: boolean;
  onClose: () => void;
}

function PageModuleEditorDialog({ pageNodeId, open, onClose }: PageModuleEditorDialogProps) {
  const { dom } = useDom();
  const domApi = useDomApi();

  const page = appDom.getNode(dom, pageNodeId, 'page');

  const value = page.attributes.module?.value || DEFAULT_CONTENT;

  const [input, setInput] = React.useState(value);

  const hasUnsavedChanges = input !== value;

  const handleSave = React.useCallback(() => {
    const pretty = tryFormat(input);
    setInput(pretty);

    domApi.update((draft) =>
      appDom.setNodeNamespacedProp(draft, page, 'attributes', 'module', appDom.createConst(pretty)),
    );
  }, [domApi, input, page]);

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

      onClose();
    },
    [hasUnsavedChanges, onClose],
  );

  const handleDialogCloseWithoutCheck = React.useMemo(
    () => handleDialogClose(true),
    [handleDialogClose],
  );
  const handleDialogCloseWithCheck = React.useMemo(
    () => handleDialogClose(false),
    [handleDialogClose],
  );

  const handleSaveButton = React.useCallback(() => {
    handleSave();
    handleDialogCloseWithoutCheck();
  }, [handleDialogCloseWithoutCheck, handleSave]);

  useShortcut({ key: 's', metaKey: true, disabled: !open }, handleSave);

  React.useEffect(() => {
    setInput(value);
  }, [value]);

  return (
    <Dialog onClose={handleDialogCloseWithCheck} open={open} fullWidth maxWidth="lg">
      <DialogTitle>Edit page module</DialogTitle>
      <Box sx={{ height: 500 }}>
        <TypescriptEditor
          value={input}
          onChange={(newValue) => setInput(newValue)}
          extraLibs={EXTRA_LIBS_HTTP_MODULES}
        />
      </Box>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={handleDialogCloseWithCheck}>
          Cancel
        </Button>
        <Button onClick={handleSaveButton}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export interface PageModuleEditorProps {
  pageNodeId: NodeId;
}

export default function PageModuleEditor({ pageNodeId }: PageModuleEditorProps) {
  const { currentView } = useAppState();
  const appStateApi = useAppStateApi();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleButtonClick = React.useCallback(() => {
    appStateApi.setView({
      kind: 'page',
      nodeId: pageNodeId,
      view: { kind: 'pageModule' },
    });
  }, [appStateApi, pageNodeId]);

  const handleDialogClose = React.useCallback(() => {
    appStateApi.setView({ kind: 'page', nodeId: pageNodeId });
  }, [appStateApi, pageNodeId]);

  React.useEffect(() => {
    setDialogOpen(currentView.kind === 'page' && currentView.view?.kind === 'pageModule');
  }, [currentView]);

  return (
    <React.Fragment>
      <Button color="inherit" onClick={handleButtonClick} startIcon={<CodeIcon />}>
        Edit page module
      </Button>
      <PageModuleEditorDialog
        pageNodeId={pageNodeId}
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </React.Fragment>
  );
}
