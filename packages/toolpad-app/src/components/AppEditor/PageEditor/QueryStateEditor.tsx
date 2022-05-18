import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  List,
  ListItem,
  SelectChangeEvent,
  DialogActions,
  Box,
  LinearProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { ArgTypeDefinitions, UseDataQuery } from '@mui/toolpad-core';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomLoader';
import { usePageEditorState } from './PageEditorProvider';
import * as appDom from '../../../appDom';
import { NodeId } from '../../../types';
import { ExactEntriesOf } from '../../../utils/types';
import { getQueryNodeArgTypes } from '../../../toolpadDataSources/client';
import NodeAttributeEditor from './NodeAttributeEditor';
import NodeNameEditor from '../NodeNameEditor';
import JsonView from '../../JsonView';

interface ParamsEditorProps<Q> {
  node: appDom.AppDomNode;
  argTypes: ArgTypeDefinitions<Q>;
}

function ParamsEditor<Q>({ node, argTypes }: ParamsEditorProps<Q>) {
  return (
    <Stack spacing={1}>
      {(Object.entries(argTypes) as ExactEntriesOf<ArgTypeDefinitions<Q>>).map(
        ([propName, propTypeDef]) =>
          propTypeDef ? (
            <div key={propName}>
              <NodeAttributeEditor
                node={node}
                namespace="params"
                name={propName}
                argType={propTypeDef}
              />
            </div>
          ) : null,
      )}
    </Stack>
  );
}

interface PreviewQueryStateResultProps {
  node: appDom.QueryStateNode;
}

function PreviewQueryStateResult({ node }: PreviewQueryStateResultProps) {
  const { pageState } = usePageEditorState();
  const actualNodeState: UseDataQuery | undefined = pageState[node.name] as any;
  if (!node.attributes.api.value) {
    return null;
  }
  return (
    <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
      {actualNodeState?.isLoading ? <LinearProgress /> : null}
      {actualNodeState?.error ? (
        <Alert severity="error">
          {actualNodeState?.error.message || actualNodeState?.error || 'Something went wrong'}
        </Alert>
      ) : null}
      {actualNodeState?.data ? <JsonView src={actualNodeState.data} /> : null}
    </Box>
  );
}

function refetchIntervalInSeconds(maybeInterval?: number) {
  if (typeof maybeInterval !== 'number') {
    return undefined;
  }
  const seconds = Math.floor(maybeInterval / 1000);
  return seconds > 0 ? seconds : undefined;
}

interface QueryStateNodeEditorProps<P> {
  node: appDom.QueryStateNode<P>;
}

function QueryStateNodeEditor<P>({ node }: QueryStateNodeEditorProps<P>) {
  const dom = useDom();
  const domApi = useDomApi();
  const app = appDom.getApp(dom);
  const { apis = [] } = appDom.getChildNodes(dom, app);

  const handleSelectionChange = React.useCallback(
    (event: SelectChangeEvent<'' | NodeId>) => {
      const apiNodeId = event.target.value ? (event.target.value as NodeId) : null;
      domApi.setNodeNamespacedProp(node, 'attributes', 'api', appDom.createConst(apiNodeId));
    },
    [domApi, node],
  );

  const handleRefetchOnWindowFocusChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      domApi.setNodeNamespacedProp(
        node,
        'attributes',
        'refetchOnWindowFocus',
        appDom.createConst(event.target.checked),
      );
    },
    [domApi, node],
  );

  const handleRefetchOnReconnectChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      domApi.setNodeNamespacedProp(
        node,
        'attributes',
        'refetchOnReconnect',
        appDom.createConst(event.target.checked),
      );
    },
    [domApi, node],
  );

  const handleRefetchIntervalChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const interval = Number(event.target.value);

      if (Number.isNaN(interval) || interval <= 0) {
        domApi.setNodeNamespacedProp(node, 'attributes', 'refetchInterval', undefined);
      } else {
        domApi.setNodeNamespacedProp(
          node,
          'attributes',
          'refetchInterval',
          appDom.createConst(interval * 1000),
        );
      }
    },
    [domApi, node],
  );

  const argTypes = getQueryNodeArgTypes(dom, node);

  return (
    <React.Fragment>
      <Stack spacing={1} py={1}>
        <NodeNameEditor node={node} />
        <FormControl fullWidth size="small">
          <InputLabel id={`select-data-query`}>Query</InputLabel>
          <Select
            value={node.attributes.api.value || ''}
            labelId="select-data-query"
            label="Query"
            onChange={handleSelectionChange}
            size="small"
          >
            <MenuItem value="">---</MenuItem>
            {apis.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ParamsEditor node={node} argTypes={argTypes} />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={node.attributes.refetchOnWindowFocus?.value ?? true}
              onChange={handleRefetchOnWindowFocusChange}
            />
          }
          label="Refetch on window focus"
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={node.attributes.refetchOnReconnect?.value ?? true}
              onChange={handleRefetchOnReconnectChange}
            />
          }
          label="Refetch on network reconnect"
        />
        <TextField
          InputProps={{
            startAdornment: <InputAdornment position="start">s</InputAdornment>,
          }}
          sx={{ maxWidth: 300 }}
          size="small"
          type="number"
          label="Refetch interval"
          value={refetchIntervalInSeconds(node.attributes.refetchInterval?.value) ?? ''}
          onChange={handleRefetchIntervalChange}
        />
        <PreviewQueryStateResult node={node} />
      </Stack>
    </React.Fragment>
  );
}

export default function QueryStateEditor() {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [editedState, setEditedState] = React.useState<NodeId | null>(null);
  const editedStateNode = editedState ? appDom.getNode(dom, editedState, 'queryState') : null;
  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = appDom.getNode(dom, state.nodeId, 'page');
  const { queryStates = [] } = appDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    const stateNode = appDom.createNode(dom, 'queryState', {
      params: {},
      attributes: { api: appDom.createConst(null) },
    });
    domApi.addNode(stateNode, page, 'queryStates');
    setEditedState(stateNode.id);
  }, [dom, domApi, page]);

  // To keep it around during closing animation
  const lastEditedStateNode = useLatest(editedStateNode);

  const handleRemove = React.useCallback(() => {
    if (editedStateNode) {
      domApi.removeNode(editedStateNode.id);
    }
    handleEditStateDialogClose();
  }, [editedStateNode, handleEditStateDialogClose, domApi]);

  return (
    <Stack spacing={1} alignItems="start">
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleCreate}>
        create query state
      </Button>
      <List>
        {queryStates.map((stateNode) => {
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
          maxWidth="lg"
          open={!!editedStateNode}
          onClose={handleEditStateDialogClose}
          scroll="body"
        >
          <DialogTitle>Edit Query State ({lastEditedStateNode.id})</DialogTitle>
          <DialogContent>
            <QueryStateNodeEditor node={lastEditedStateNode} />
          </DialogContent>
          <DialogActions>
            <Button color="inherit" variant="text" onClick={handleEditStateDialogClose}>
              Close
            </Button>
            <Button onClick={handleRemove}>Remove</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
