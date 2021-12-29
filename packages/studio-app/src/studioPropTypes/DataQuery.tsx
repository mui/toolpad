import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import * as React from 'react';
import QueryEditor from '../components/QueryEditor';
import type { PropTypeDefinition, EditorProps, StudioPageQuery } from '../types';
import { useEditorApi, useEditorState } from '../components/StudioEditor/EditorProvider';
import { newQueryId } from '../studioPage';

function DataQueryEditor<Q>({ value, onChange }: EditorProps<string | null>) {
  const state = useEditorState();
  const api = useEditorApi();
  const queryId = React.useMemo(() => value || newQueryId(state.page), [value, state.page]);
  const [editoropen, setEditorOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setEditorOpen(true), []);
  const handleClose = React.useCallback(() => setEditorOpen(false), []);
  const [input, setInput] = React.useState<StudioPageQuery<Q> | null>(
    (value && state.page.queries[value]) || null,
  );

  const handleSave = React.useCallback(() => {
    if (input) {
      api.saveQuery(queryId, input);
      handleClose();
      onChange(queryId);
    }
  }, [api, queryId, input, handleClose, onChange]);

  return (
    <React.Fragment>
      <Dialog onClose={handleClose} open={editoropen}>
        <DialogTitle>Query</DialogTitle>
        <DialogContent>
          <QueryEditor value={input} onChange={setInput} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Button onClick={handleOpen}>edit</Button>
    </React.Fragment>
  );
}

const dataQueryType: PropTypeDefinition<string | null> = {
  Editor: DataQueryEditor,
};

export default dataQueryType;
