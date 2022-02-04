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

function parseObjectPaths(paths: Record<string, string>): Record<string, ObjectPath> {
  return Object.fromEntries(
    Object.entries(paths).map(([key, path]) => {
      return [key, parseObjectPath(path)];
    }),
  );
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

function fromCollection(object: unknown): any[] {
  if (Array.isArray(object)) {
    return object;
  }

  if (typeof object === 'object' && object) {
    return Object.entries(object);
  }

  return [];
}

function select(object: unknown, objectPaths: Record<string, ObjectPath>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(objectPaths).map(([key, path]) => {
      return [key, getObjectPath(object, path as ObjectPath)];
    }),
  );
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
    <Box display="grid" gridTemplateColumns="1fr 2fr auto" alignItems="center" gap={1}>
      {Object.entries(value).map(([field, path]) => (
        <React.Fragment>
          <Box ml={2} justifySelf="end">
            {field}:
          </Box>
          <TextField label="path" size="small" value={path} onChange={handlePathChange(field)} />
          <IconButton onClick={handleRemove(field)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      ))}

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
        size="small"
        disabled={!newFieldName || hasOwnProperty(value, newFieldName)}
        onClick={handleNewField}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
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

  const fields = Object.keys(value.fieldPaths).join(',');
  const columns = React.useMemo(() => fields.split(',').map((field) => ({ field })), [fields]);

  const { data, error, isLoading } = useQuery(value.url.value, simpleFetch);

  const collection = fromCollection(getObjectPath(data, parseObjectPath(value.collectionPath)));

  const rows = React.useMemo(() => {
    return collection.map((row, i) => {
      const paths = parseObjectPaths(value.fieldPaths);
      const resultRow = select(row, paths);
      return {
        id: i,
        ...resultRow,
      };
    });
  }, [collection, value.fieldPaths]);

  const rawDisplay = React.useMemo(() => JSON.stringify(data, null, 2), [data]);
  const collectionDisplay = React.useMemo(() => JSON.stringify(collection, null, 2), [collection]);

  return (
    <Stack direction="row" gap={2} my={1} flex={1}>
      <Stack direction="column" gap={2} overflow="auto">
        <BindableEditor
          label="url"
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
        <FieldsEditor value={value.fieldPaths} onChange={handleFieldPathsChange} />
      </Stack>
      <TabContext value={tab}>
        <Stack sx={{ flex: 1 }}>
          <TabList
            onChange={(event, newTab) => setTab(newTab)}
            aria-label="FetchedState node collection display selector"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
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
              columns={columns}
              rows={rows}
              density="compact"
              error={error}
              loading={isLoading}
            />
          </TabPanel>
        </Stack>
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
