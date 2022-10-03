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
import { BindableAttrEntries, BindableAttrValues, NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import useLatest from '../../../utils/useLatest';
import { usePageEditorState } from './PageEditorProvider';
import * as appDom from '../../../appDom';
import { QueryEditorModel, QueryEditorShellProps } from '../../../types';
import dataSources from '../../../toolpadDataSources/client';
import NodeNameEditor from '../NodeNameEditor';
import { update } from '../../../utils/immutability';
import { useDom, useDomApi } from '../../DomLoader';
import { ConnectionContextProvider } from '../../../toolpadDataSources/context';
import ConnectionSelect, { ConnectionOption } from './ConnectionSelect';
import { createProvidedContext } from '../../../utils/react';

const DATASOURCES_WHITELIST = ['function'];

const EMPTY_OBJECT = {};

interface RenderDialogActions {
  (params: { isDirty?: boolean; onCommit?: () => void }): React.ReactNode;
}

interface MutationEditorDialogContext {
  open: boolean;
  onClose: () => void;
  dataSourceId: string | null;
  renderDialogTitle: () => React.ReactNode;
  renderDialogActions: RenderDialogActions;
}

const [useMutationEditorDialogContext, MutationEditorDialogContextProvider] =
  createProvidedContext<MutationEditorDialogContext>('MutationEditorDialog');

export function MutationEditorShell({ children, isDirty, onCommit }: QueryEditorShellProps) {
  const { open, onClose, dataSourceId, renderDialogTitle, renderDialogActions } =
    useMutationEditorDialogContext();

  return (
    <Dialog fullWidth maxWidth="xl" open={open} onClose={onClose}>
      {renderDialogTitle()}

      <Divider />

      {dataSourceId ? (
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
            {children}
          </Box>
        </DialogContent>
      ) : (
        <DialogContent>
          <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
        </DialogContent>
      )}

      {renderDialogActions({ isDirty, onCommit })}
    </Dialog>
  );
}

interface DataSourceSelectorProps<Q> {
  open: boolean;
  onClose: () => void;
  onCreated: (newNode: appDom.MutationNode<Q>) => void;
}

function ConnectionSelectorDialog<Q>({ open, onCreated, onClose }: DataSourceSelectorProps<Q>) {
  const dom = useDom();

  const [input, setInput] = React.useState<ConnectionOption | null>(null);

  const handleCreateClick = React.useCallback(() => {
    invariant(input, `Create button should be disabled when there's no input`);

    const { connectionId = null, dataSourceId } = input;

    if (connectionId) {
      const connection = appDom.getMaybeNode(dom, connectionId, 'connection');
      invariant(connection, `Selected non-existing connection "${connectionId}"`);
    }

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
    <Dialog fullWidth open={open} onClose={onClose} scroll="body">
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
        <Button disabled={!input} onClick={handleCreateClick}>
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

  const [input, setInput] = React.useState<appDom.MutationNode<Q, P>>(node);
  React.useEffect(() => {
    if (open) {
      setInput(node);
    }
  }, [open, node]);

  const connectionId = input.attributes.connectionId.value
    ? appDom.deref(input.attributes.connectionId.value)
    : null;
  const connection = connectionId ? appDom.getMaybeNode(dom, connectionId, 'connection') : null;
  const inputParams = input.params || EMPTY_OBJECT;
  const dataSourceId = input.attributes.dataSource?.value || null;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const connectionParams = connection?.attributes.params.value;

  const queryModel = React.useMemo<QueryEditorModel<any>>(
    () => ({
      query: input.attributes.query.value,
      params:
        (Object.entries(inputParams).filter(([, value]) =>
          Boolean(value),
        ) as BindableAttrEntries) || [],
    }),
    [input.attributes.query.value, inputParams],
  );

  const handleQueryModelChange = React.useCallback(
    (model: QueryEditorModel<Q>) => {
      onSave(
        update(input, {
          attributes: update(input.attributes, {
            query: appDom.createConst(model.query),
          }),
          params: Object.fromEntries(model.params) as BindableAttrValues<P>,
        }),
      );
    },
    [input, onSave],
  );

  const { pageState } = usePageEditorState();

  const handleConnectionChange = React.useCallback(
    (newConnectionOption: ConnectionOption | null) => {
      if (newConnectionOption) {
        setInput((existing) =>
          update(existing, {
            attributes: update(existing.attributes, {
              connectionId: appDom.createConst(appDom.ref(newConnectionOption.connectionId)),
              dataSource: appDom.createConst(newConnectionOption.dataSourceId),
            }),
          }),
        );
      } else {
        setInput((existing) =>
          update(existing, {
            attributes: update(existing.attributes, {
              connectionId: undefined,
              dataSource: undefined,
            }),
          }),
        );
      }
    },
    [],
  );

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

  const queryEditorContext = React.useMemo(
    () => (dataSourceId ? { appId, dataSourceId, connectionId } : null),
    [appId, dataSourceId, connectionId],
  );

  const renderDialogTitle = React.useCallback(
    () => (
      <DialogTitle>
        <Stack direction="row" gap={2}>
          <NodeNameEditor node={node} />
          <ConnectionSelect
            dataSource={dataSourceId}
            value={
              input.attributes.dataSource
                ? {
                    connectionId: appDom.deref(input.attributes.connectionId.value) || null,
                    dataSourceId: input.attributes.dataSource.value,
                  }
                : null
            }
            onChange={handleConnectionChange}
          />
        </Stack>
      </DialogTitle>
    ),
    [
      dataSourceId,
      handleConnectionChange,
      input.attributes.connectionId.value,
      input.attributes.dataSource,
      node,
    ],
  );

  const renderDialogActions: RenderDialogActions = React.useCallback(
    ({ isDirty, onCommit }) => {
      return (
        <DialogActions>
          <Button color="inherit" variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleRemove}>Remove</Button>
          <Button disabled={isInputSaved && !isDirty} onClick={onCommit}>
            Save
          </Button>
        </DialogActions>
      );
    },
    [handleClose, handleRemove, isInputSaved],
  );

  const mutationEditorShellContext: MutationEditorDialogContext = {
    open,
    onClose: handleClose,
    dataSourceId: dataSource ? dataSourceId : null,
    renderDialogTitle,
    renderDialogActions,
  };

  return (
    <MutationEditorDialogContextProvider value={mutationEditorShellContext}>
      {dataSourceId && dataSource && queryEditorContext ? (
        <ConnectionContextProvider value={queryEditorContext}>
          <dataSource.QueryEditor
            QueryEditorShell={MutationEditorShell}
            connectionParams={connectionParams}
            value={queryModel}
            onChange={handleQueryModelChange}
            globalScope={pageState}
          />
        </ConnectionContextProvider>
      ) : (
        <MutationEditorShell>
          <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
        </MutationEditorShell>
      )}
    </MutationEditorDialogContextProvider>
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
      {!process.env.TOOLPAD_DEMO ? (
        <Button color="inherit" startIcon={<AddIcon />} onClick={handleCreate}>
          Add mutation
        </Button>
      ) : null}
      <List>
        {mutations.map((mutationNode) => {
          return (
            <ListItem
              key={mutationNode.id}
              button
              onClick={() => setDialogState({ nodeId: mutationNode.id })}
            >
              {mutationNode.name}
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
