import CodeIcon from '@mui/icons-material/Code';
import { Box, Button, Dialog, DialogActions, DialogTitle, Skeleton } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import * as React from 'react';
import { useDom, useDomApi } from '../../DomLoader';
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
  const [input, setInput] = React.useState(page.attributes.module?.value || DEFAULT_CONTENT);

  const handleSave = React.useCallback(() => {
    const pretty = tryFormat(input);
    setInput(pretty);

    domApi.update((draft) =>
      appDom.setNodeNamespacedProp(draft, page, 'attributes', 'module', appDom.createConst(pretty)),
    );
  }, [domApi, input, page]);

  const handleSaveButton = React.useCallback(() => {
    handleSave();
    onClose();
  }, [handleSave, onClose]);

  useShortcut({ key: 's', metaKey: true, disabled: !open }, handleSave);

  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="lg">
      <DialogTitle>Edit page module</DialogTitle>
      <Box sx={{ height: 500 }}>
        <TypescriptEditor
          value={input}
          onChange={(newValue) => setInput(newValue)}
          extraLibs={EXTRA_LIBS_HTTP_MODULES}
        />
      </Box>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
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
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Button color="inherit" onClick={() => setDialogOpen(true)} startIcon={<CodeIcon />}>
        Edit page module
      </Button>
      <PageModuleEditorDialog
        pageNodeId={pageNodeId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </React.Fragment>
  );
}
