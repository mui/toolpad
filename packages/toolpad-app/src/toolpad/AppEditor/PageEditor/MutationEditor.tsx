import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  DialogActions,
  Divider,
  Alert,
  Box,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import useLatest from '../../../utils/useLatest';
import { usePageEditorState } from './PageEditorProvider';
import * as appDom from '../../../appDom';
import { QueryEditorModel } from '../../../types';
import dataSources from '../../../toolpadDataSources/client';
import NodeNameEditor from '../NodeNameEditor';
import { update } from '../../../utils/immutability';
import { useEvaluateLiveBindings } from '../useEvaluateLiveBinding';
import { useDom, useDomApi } from '../../DomLoader';
import { ConnectionContextProvider } from '../../../toolpadDataSources/context';
import ConnectionSelect from './ConnectionSelect';

const DATASOURCES_WHITELIST = ['function'];

interface DataSourceSelectorProps<Q> {
  open: boolean;
  onClose: () => void;
  onCreated: (newNode: appDom.MutationNode<Q>) => void;
}

function ConnectionSelectorDialog<Q>({ open, onCreated, onClose }: DataSourceSelectorProps<Q>) {
  const dom = useDom();

  const [input, setInput] = React.useState<NodeId | null>(null);

  const handleClick = React.useCallback(() => {
    const connectionId = input;
    const connection = connectionId && appDom.getMaybeNode(dom, connectionId, 'connection');

    invariant(connection, `Selected non-existing connection "${connectionId}"`);

    const dataSourceId = connection.attributes.dataSource.value;
    const dataSource = dataSources[dataSourceId];
    invariant(dataSource, `Selected non-existing dataSource "${dataSourceId}"`);

    const mutationNode = appDom.createNode(dom, 'mutation', {
      attributes: {
        query: appDom.createConst(dataSource.getInitialQueryValue()),
        connectionId: appDom.createConst(appDom.ref(connectionId)),
        dataSource: appDom.createConst(dataSourceId),
      },
    });

    onCreated(mutationNode);
  }, [dom, input, onCreated]);

  return (
    <Dialog open={open} onClose={onClose} scroll="body">
      <DialogTitle>Create Mutation</DialogTitle>
      <DialogContent>
        <ConnectionSelect
          dataSource={DATASOURCES_WHITELIST}
          sx={{ my: 1 }}
          value={input}
          onChange={setInput}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!input} onClick={handleClick}>
          Create mutation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface MutationNodeEditorProps<Q, P> {
  open: boolean;
  onClose: () => void;
  onSave: (newNode: appDom.MutationNode) => void;
  onRemove: (newNode: appDom.MutationNode) => void;
  node: appDom.MutationNode<Q, P>;
}

function MutationNodeEditorDialog<Q, P>({
  open,
  node,
  onClose,
  onRemove,
  onSave,
}: MutationNodeEditorProps<Q, P>) {
  const { appId } = usePageEditorState();
  const dom = useDom();

  const [input, setInput] = React.useState(node);
  React.useEffect(() => {
    if (open) {
      setInput(node);
    }
  }, [open, node]);

  const connectionId = appDom.deref(input.attributes.connectionId.value);
  const connection = appDom.getMaybeNode(dom, connectionId, 'connection');
  const dataSourceId = input.attributes.dataSource?.value;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const handleConnectionChange = React.useCallback((newConnectionId: NodeId | null) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          connectionId: newConnectionId
            ? appDom.createConst(appDom.ref(newConnectionId))
            : undefined,
        }),
      }),
    );
  }, []);

  const handleQueryChange = React.useCallback((model: QueryEditorModel<Q>) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          query: appDom.createConst(model.query),
        }),
        params: model.params,
      }),
    );
  }, []);

  const { pageState } = usePageEditorState();

  const liveParams = useEvaluateLiveBindings({
    input: input.params || {},
    globalScope: pageState,
  });

  const handleSave = React.useCallback(() => {
    onSave(input);
  }, [onSave, input]);

  const handleRemove = React.useCallback(() => {
    onRemove(node);
    onClose();
  }, [onRemove, node, onClose]);

  const isInputSaved = node === input;

  const handleClose = React.useCallback(() => {
    const ok = isInputSaved
      ? true
      : // eslint-disable-next-line no-alert
        window.confirm(
          'Are you sure you want to close the editor. All unsaved progress will be lost.',
        );

    if (ok) {
      onClose();
    }
  }, [onClose, isInputSaved]);

  const queryEditorContext = React.useMemo(() => ({ appId, connectionId }), [appId, connectionId]);

  return (
    <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
      <DialogTitle>
        <Stack direction="row" gap={2}>
          <NodeNameEditor node={node} />
          <ConnectionSelect
            dataSource={dataSourceId}
            value={appDom.deref(input.attributes.connectionId.value) || null}
            onChange={handleConnectionChange}
          />
        </Stack>
      </DialogTitle>
      <Divider />

      {dataSourceId && dataSource ? (
        <DialogContent
          sx={{
            // height will be clipped by max-height
            height: '100vh',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              display: 'flex',
            }}
          >
            <ConnectionContextProvider value={queryEditorContext}>
              <dataSource.QueryEditor
                connectionParams={connection?.attributes.params.value}
                value={{
                  query: input.attributes.query.value,
                  params: input.params,
                }}
                liveParams={liveParams}
                onChange={handleQueryChange}
                globalScope={pageState}
              />
            </ConnectionContextProvider>
          </Box>
        </DialogContent>
      ) : (
        <DialogContent>
          <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
        </DialogContent>
      )}
      <DialogActions>
        <Button color="inherit" variant="text" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleRemove}>Remove</Button>
        <Button disabled={isInputSaved} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type DialogState = {
  nodeId?: NodeId;
};

export default function MutationEditor() {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [dialogState, setDialogState] = React.useState<DialogState | null>(null);

  const handleEditStateDialogClose = React.useCallback(() => setDialogState(null), []);

  const page = appDom.getNode(dom, state.nodeId, 'page');
  const { mutations = [] } = appDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    setDialogState({});
  }, []);

  const handleCreated = React.useCallback(
    (node: appDom.MutationNode) => {
      domApi.addNode(node, page, 'mutations');
      setDialogState({ nodeId: node.id });
    },
    [domApi, page],
  );

  const handleSave = React.useCallback(
    (node: appDom.MutationNode) => {
      domApi.saveNode(node);
    },
    [domApi],
  );

  const handleRemove = React.useCallback(
    (node: appDom.MutationNode) => {
      domApi.removeNode(node.id);
    },
    [domApi],
  );

  const editedNode = dialogState?.nodeId
    ? appDom.getMaybeNode(dom, dialogState.nodeId, 'mutation')
    : null;

  // To keep it around during closing animation
  const lastEditednode = useLatest(editedNode);

  return (
    <Stack spacing={1} alignItems="start">
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleCreate}>
        Add mutation
      </Button>
      <List>
        {mutations.map((MutationNode) => {
          return (
            <ListItem
              key={MutationNode.id}
              button
              onClick={() => setDialogState({ nodeId: MutationNode.id })}
            >
              {MutationNode.name}
            </ListItem>
          );
        })}
      </List>
      {dialogState?.nodeId && lastEditednode ? (
        <MutationNodeEditorDialog
          open={!!dialogState}
          node={lastEditednode}
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={handleEditStateDialogClose}
        />
      ) : (
        <ConnectionSelectorDialog
          open={!!dialogState}
          onCreated={handleCreated}
          onClose={handleEditStateDialogClose}
        />
      )}
    </Stack>
  );
}
