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
  IconButton,
} from '@mui/material';
import React from 'react';
import { ArgTypeDefinition } from '@mui/studio-core';
import { QueryFunction, useQuery } from 'react-query';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageEditorProvider';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioBindable } from '../../../types';
import { WithControlledProp } from '../../../utils/types';
import { BindableEditor } from './ComponentPropEditor';
import { hasOwnProperty } from '../../../utils/collections';
import { omit } from '../../../utils/immutability';

const simpleFetch: QueryFunction<unknown, string> = async ({ queryKey }) => {
  const [url] = queryKey;
  return fetch(url).then((res) => res.json());
};

type ObjectPath = string[];

function parseObjectPath(path: string): ObjectPath {
  return path.split('.').filter(Boolean);
}

function getObjectPath(object: unknown, path: ObjectPath): unknown | null {
  if (path.length <= 0) {
    return object;
  }
  const [first, ...rest] = path;
  if (typeof object === 'object' && object && hasOwnProperty(object, first)) {
    return getObjectPath(object[first], rest);
  }
  return null;
}

function fromCollection(object: unknown): { id: string; values: unknown }[] {
  if (Array.isArray(object)) {
    return object.map((values, i) => ({ id: String(i), values }));
  }

  if (typeof object === 'object' && object) {
    return Object.entries(object).map(([id, values]) => ({ id, values }));
  }

  return [];
}

const URL_ARGTYPE: ArgTypeDefinition = {
  typeDef: { type: 'string' },
};

function JsonDisplay({ children }: React.PropsWithChildren<{}>) {
  return (
    <Box sx={{ height: 224, overflow: 'auto' }}>
      <pre>{children}</pre>
    </Box>
  );
}

interface FieldsEditorProps extends WithControlledProp<Record<string, string>> {}

function FieldsEditor({ value, onChange }: FieldsEditorProps) {
  const [newFieldName, setNewFieldName] = React.useState('');
  const [newFieldPath, setNewFieldPath] = React.useState('');

  const handlePathChange = React.useCallback(
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [field]: event.target.value });
    },
    [onChange, value],
  );

  const handleRemove = React.useCallback(
    (field: string) => () => {
      onChange(omit(value, field));
    },
    [onChange, value],
  );

  const handleNewField = React.useCallback(() => {
    onChange({ ...value, [newFieldName]: newFieldPath });
    setNewFieldName('');
    setNewFieldPath('');
  }, [newFieldName, newFieldPath, onChange, value]);
  return (
    <Stack direction="column">
      {Object.entries(value).map(([field, path]) => (
        <Stack direction="row">
          {field}: <TextField size="small" value={path} onChange={handlePathChange(field)} />
          <IconButton onClick={handleRemove(field)}>
            <CloseIcon />
          </IconButton>
        </Stack>
      ))}
      <Stack direction="row">
        <TextField
          size="small"
          label="field"
          value={newFieldName}
          onChange={(event) => setNewFieldName(event.target.value)}
        />
        <TextField
          size="small"
          label="path"
          value={newFieldPath}
          onChange={(event) => setNewFieldPath(event.target.value)}
        />
        <IconButton
          disabled={!newFieldName || hasOwnProperty(value, newFieldName)}
          onClick={handleNewField}
        >
          <AddIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
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

  const [columns, setColumns] = React.useState<GridColumns>([{ field: 'id' }, { field: 'values' }]);

  const { data, error, isLoading } = useQuery(value.url.value, simpleFetch);

  const collection = fromCollection(getObjectPath(data, parseObjectPath(value.collectionPath)));

  const rows = collection;

  const columnsFingerPrint = React.useMemo(() => JSON.stringify(columns), [columns]);

  const rawDisplay = React.useMemo(() => JSON.stringify(data, null, 2), [data]);
  const collectionDisplay = React.useMemo(() => JSON.stringify(collection, null, 2), [collection]);

  return (
    <Stack direction="column" gap={2} my={1}>
      <Stack direction="row">
        <BindableEditor
          label="url"
          nodeId={nodeId}
          argType={URL_ARGTYPE}
          value={value.url}
          onChange={handleUrlChange}
        />
        <TextField
          size="small"
          value={value.collectionPath}
          onChange={handleCollectionPathChange}
        />
      </Stack>
      <FieldsEditor value={value.fieldPaths} onChange={handleFieldPathsChange} />
      <TabContext value={tab}>
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <TabList
            orientation="vertical"
            onChange={(event, newTab) => setTab(newTab)}
            aria-label="FetchedState node collection display selector"
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab label="Raw" value="raw" />
            <Tab label="Collection" value="collection" />
            <Tab label="Result" value="result" />
          </TabList>
          <TabPanel value="raw" sx={{ flex: 1, p: 1 }}>
            <JsonDisplay>{rawDisplay}</JsonDisplay>
          </TabPanel>
          <TabPanel value="collection" sx={{ flex: 1, p: 1 }}>
            <JsonDisplay>{collectionDisplay}</JsonDisplay>
          </TabPanel>
          <TabPanel value="result" sx={{ flex: 1, p: 1 }}>
            <DataGridPro
              autoHeight
              key={columnsFingerPrint}
              columns={columns}
              rows={rows}
              density="compact"
              pagination
              pageSize={5}
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

  const [editedStateNode, setEditedState] = React.useState<studioDom.StudioFetchedStateNode | null>(
    null,
  );
  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = studioDom.getNode(dom, state.nodeId);
  studioDom.assertIsPage(page);
  const { fetchedStates = [] } = studioDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    const stateNode = studioDom.createNode(dom, 'fetchedState', {
      url: { type: 'const', value: '' },
      collectionPath: '',
      fieldPaths: {},
    });
    setEditedState(stateNode);
  }, [dom]);

  // To keep it around during closing animation
  const lastEditedStateNode = useLatest(editedStateNode);

  const handleSave = React.useCallback(() => {
    if (editedStateNode?.parentId) {
      domApi.saveNode(editedStateNode);
    } else if (editedStateNode) {
      domApi.addNode(editedStateNode, page, 'fetchedStates');
    }
    handleEditStateDialogClose();
  }, [domApi, editedStateNode, handleEditStateDialogClose, page]);

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
            <ListItem key={stateNode.id} button onClick={() => setEditedState(stateNode)}>
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
          <DialogContent>
            <FetchedStateNodeEditor
              nodeId={pageNodeId}
              value={lastEditedStateNode}
              onChange={(newValue) => setEditedState(newValue)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSave}>Save</Button>
            {lastEditedStateNode.parentId ? <Button onClick={handleRemove}>Remove</Button> : null}
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
