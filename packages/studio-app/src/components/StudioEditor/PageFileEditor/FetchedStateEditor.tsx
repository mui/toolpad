import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  DialogActions,
  TextField,
  Box,
  Tab,
} from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinition, useFetchedState } from '@mui/studio-core';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomLoader';
import { usePageEditorState } from './PageEditorProvider';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioBindable } from '../../../types';
import { WithControlledProp } from '../../../utils/types';
import { BindableEditor } from './ComponentPropEditor';
import StringRecordEditor from '../../StringRecordEditor';

const URL_ARGTYPE: ArgTypeDefinition = {
  typeDef: { type: 'string' },
};

function JsonDisplay({ children }: React.PropsWithChildren<{}>) {
  return <pre>{children}</pre>;
}

type FetchedStateNodeEditorTab = 'raw' | 'collection' | 'resul';

interface FetchedStateNodeEditorProps extends WithControlledProp<studioDom.StudioFetchedStateNode> {
  nodeId: NodeId;
}

function FetchedStateNodeEditor({ nodeId, value, onChange }: FetchedStateNodeEditorProps) {
  const handleUrlChange = React.useCallback(
    (newUrl: StudioBindable<string> | null) => {
      onChange({ ...value, url: newUrl || { type: 'const', value: '' } });
    },
    [onChange, value],
  );

  const [tab, setTab] = React.useState<FetchedStateNodeEditorTab>('raw');

  const handleCollectionPathChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, collectionPath: event.target.value });
    },
    [onChange, value],
  );

  const handleFieldPathsChange = React.useCallback(
    (newpaths: Record<string, string>) => {
      onChange({ ...value, fieldPaths: newpaths });
    },
    [onChange, value],
  );

  const { error, loading, rows, columns, raw } = useFetchedState({
    url: value.url.value,
    collectionPath: value.collectionPath,
    fieldPaths: value.fieldPaths,
  });

  const rawDisplay = React.useMemo(() => JSON.stringify(raw, null, 2), [raw]);

  return (
    <Stack direction="row" gap={2} flex={1}>
      <Stack direction="column" gap={2} overflow="auto" py={1}>
        <BindableEditor
          propNamespace={null}
          propName="url"
          nodeId={nodeId}
          argType={URL_ARGTYPE}
          value={value.url}
          onChange={handleUrlChange}
        />
        <TextField
          size="small"
          label="collection path"
          value={value.collectionPath}
          onChange={handleCollectionPathChange}
        />
        <StringRecordEditor
          fieldLabel="field"
          valueLabel="path"
          value={value.fieldPaths}
          onChange={handleFieldPathsChange}
        />
      </Stack>
      <TabContext value={tab}>
        <Box display="flex" flexDirection="column" flex={1}>
          <TabList
            onChange={(event, newTab) => setTab(newTab)}
            aria-label="FetchedState node collection display selector"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Raw" value="raw" />
            <Tab label="Result" value="result" />
          </TabList>
          <TabPanel value="raw" sx={{ flex: 1, overflow: 'auto' }}>
            <JsonDisplay>{rawDisplay}</JsonDisplay>
          </TabPanel>
          <TabPanel value="result" sx={{ flex: 1 }}>
            <DataGridPro
              columns={columns}
              rows={rows}
              density="compact"
              error={error}
              loading={loading}
            />
          </TabPanel>
        </Box>
      </TabContext>
    </Stack>
  );
}

export interface FetchedStateEditorProps {
  pageNodeId: NodeId;
}

export default function FetchedStateEditor({ pageNodeId }: FetchedStateEditorProps) {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [editedState, setEditedState] = React.useState<NodeId | null>(null);
  const editedStateNode = editedState ? studioDom.getNode(dom, editedState, 'fetchedState') : null;

  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = studioDom.getNode(dom, state.nodeId, 'page');
  const { fetchedStates = [] } = studioDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    const stateNode = studioDom.createNode(dom, 'fetchedState', {
      url: { type: 'const', value: '' },
      collectionPath: '',
      fieldPaths: {},
    });
    domApi.addNode(stateNode, page, 'fetchedStates');
    setEditedState(stateNode.id);
  }, [dom, domApi, page]);

  // To keep it around during closing animation
  const lastEditedStateNode = useLatest(editedStateNode);

  const handleSave = React.useCallback(
    (newNode: studioDom.StudioFetchedStateNode) => {
      domApi.saveNode(newNode);
    },
    [domApi],
  );

  const handleRemove = React.useCallback(() => {
    if (editedStateNode) {
      domApi.removeNode(editedStateNode.id);
    }
    handleEditStateDialogClose();
  }, [editedStateNode, handleEditStateDialogClose, domApi]);

  return (
    <Stack spacing={1} alignItems="start">
      <Button color="inherit" onClick={handleCreate}>
        create fetched state
      </Button>
      <List>
        {fetchedStates.map((stateNode) => {
          return (
            <ListItem key={stateNode.id} button onClick={() => setEditedState(stateNode.id)}>
              {stateNode.name}
            </ListItem>
          );
        })}
      </List>
      {lastEditedStateNode ? (
        <Dialog
          fullWidth
          maxWidth="xl"
          open={!!editedStateNode}
          onClose={handleEditStateDialogClose}
        >
          <DialogTitle>Edit Fetched State ({lastEditedStateNode.id})</DialogTitle>
          <DialogContent sx={{ height: '100vh', display: 'flex' }}>
            <FetchedStateNodeEditor
              nodeId={pageNodeId}
              value={lastEditedStateNode}
              onChange={handleSave}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRemove}>Remove</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
