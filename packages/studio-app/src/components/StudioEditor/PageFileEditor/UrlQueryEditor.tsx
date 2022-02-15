import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import * as React from 'react';
import StringRecordEditor from '../../StringRecordEditor';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomLoader';
import { NodeId } from '../../../types';

export interface UrlQueryEditorProps {
  pageNodeId: NodeId;
}

export default function UrlQueryEditor({ pageNodeId }: UrlQueryEditorProps) {
  const dom = useDom();
  const domApi = useDomApi();

  const page = studioDom.getNode(dom, pageNodeId, 'page');

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [input, setInput] = React.useState(page.urlQuery || {});
  React.useEffect(() => setInput(page.urlQuery || {}), [page.urlQuery]);

  const handleSave = React.useCallback(() => {
    domApi.setNodeAttribute(page, 'urlQuery', input);
  }, [domApi, page, input]);

  return (
    <React.Fragment>
      <Button onClick={() => setDialogOpen(true)}>URL query</Button>
      <Dialog fullWidth open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Edit URL query</DialogTitle>
        <DialogContent>
          <StringRecordEditor value={input} onChange={setInput} />
        </DialogContent>
        <DialogActions>
          <Button disabled={page.urlQuery === input} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
