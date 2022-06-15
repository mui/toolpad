import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import { NodeId } from '../../../types';
import MapEntriesEditor from '../../MapEntriesEditor';

export interface UrlQueryEditorProps {
  pageNodeId: NodeId;
}

const EMPTY_OBJECT = {};

export default function UrlQueryEditor({ pageNodeId }: UrlQueryEditorProps) {
  const dom = useDom();
  const domApi = useDomApi();

  const page = appDom.getNode(dom, pageNodeId, 'page');

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const rawValue: Record<string, string> = page.attributes.urlQuery.value || EMPTY_OBJECT;
  const valueAsEntries = React.useMemo(() => Object.entries(rawValue), [rawValue]);
  const [input, setInput] = React.useState(valueAsEntries);
  React.useEffect(() => setInput(valueAsEntries), [valueAsEntries]);

  const handleSave = React.useCallback(() => {
    const newRawValue = Object.fromEntries(input);
    domApi.setNodeNamespacedProp(page, 'attributes', 'urlQuery', appDom.createConst(newRawValue));
  }, [domApi, page, input]);

  return (
    <React.Fragment>
      <Button color="inherit" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
        URL query
      </Button>
      <Dialog fullWidth open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Edit URL query</DialogTitle>
        <DialogContent>
          <MapEntriesEditor
            sx={{ my: 1 }}
            fieldLabel="Parameter"
            valueLabel="Default value"
            value={input}
            onChange={setInput}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button disabled={valueAsEntries === input} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
