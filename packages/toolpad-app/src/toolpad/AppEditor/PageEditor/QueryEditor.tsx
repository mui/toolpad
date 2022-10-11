import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  DialogActions,
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  Box,
  MenuItem,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { BindableAttrEntries, BindableAttrValue, NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import useLatest from '../../../utils/useLatest';
import { usePageEditorState } from './PageEditorProvider';
import * as appDom from '../../../appDom';
import { QueryEditorModel, QueryEditorShellProps } from '../../../types';
import dataSources from '../../../toolpadDataSources/client';
import NodeNameEditor from '../NodeNameEditor';
import { omit, update } from '../../../utils/immutability';
import { useEvaluateLiveBinding } from '../useEvaluateLiveBinding';
import { useDom, useDomApi } from '../../DomLoader';
import { ConnectionContextProvider } from '../../../toolpadDataSources/context';
import ConnectionSelect, { ConnectionOption } from './ConnectionSelect';
import BindableEditor from './BindableEditor';
import { createProvidedContext } from '../../../utils/react';
import { ConfirmDialog } from '../../../components/SystemDialogs';
import useBoolean from '../../../utils/useBoolean';

const EMPTY_OBJECT = {};

interface QueryeditorDialogActionsProps {
  saveDisabled?: boolean;
  onCommit?: () => void;
  onRemove?: () => void;
  onClose?: () => void;
}

function QueryeditorDialogActions({
  saveDisabled,
  onCommit,
  onRemove,
  onClose,
}: QueryeditorDialogActionsProps) {
  const handleCommit = () => {
    onCommit?.();
    onClose?.();
  };

  const {
    value: removeConfirmOpen,
    setTrue: handleRemoveConfirmOpen,
    setFalse: handleRemoveConfirmclose,
  } = useBoolean(false);

  const handleRemoveConfirm = React.useCallback(
    (confirmed: boolean) => {
      handleRemoveConfirmclose();
      if (confirmed) {
        onRemove?.();
        onClose?.();
      }
    },
    [handleRemoveConfirmclose, onClose, onRemove],
  );

  return (
    <DialogActions>
      <Button color="inherit" variant="text" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleRemoveConfirmOpen}>Remove</Button>
      <ConfirmDialog open={removeConfirmOpen} onClose={handleRemoveConfirm} severity="error">
        Are you sure your want to remove this query?
      </ConfirmDialog>
      <Button disabled={saveDisabled} onClick={handleCommit}>
        Save
      </Button>
    </DialogActions>
  );
}

interface RenderDialogActions {
  (params: { isDirty?: boolean; onCommit?: () => void }): React.ReactNode;
}

interface QueryEditorDialogContext {
  renderDialogTitle: () => React.ReactNode;
  renderQueryOptions: () => React.ReactNode;
  renderDialogActions: RenderDialogActions;
}

const [useQueryEditorDialogContext, QueryEditorDialogContextProvider] =
  createProvidedContext<QueryEditorDialogContext>('QueryEditorDialog');

export function QueryEditorShell({ children, isDirty, onCommit }: QueryEditorShellProps) {
  const { renderDialogTitle, renderQueryOptions, renderDialogActions } =
    useQueryEditorDialogContext();

  return (
    <React.Fragment>
      {renderDialogTitle()}

      <Divider />

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

        {renderQueryOptions()}
      </DialogContent>

      {renderDialogActions({ isDirty, onCommit })}
    </React.Fragment>
  );
}

function refetchIntervalInSeconds(maybeInterval?: number) {
  if (typeof maybeInterval !== 'number') {
    return undefined;
  }
  const seconds = Math.floor(maybeInterval / 1000);
  return seconds > 0 ? seconds : undefined;
}

interface DataSourceSelectorProps<Q> {
  open: boolean;
  onClose: () => void;
  onCreated: (newNode: appDom.QueryNode<Q>) => void;
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

    const queryNode = appDom.createNode(dom, 'query', {
      attributes: {
        query: appDom.createConst(dataSource.getInitialQueryValue()),
        connectionId: appDom.createConst(appDom.ref(connectionId)),
        dataSource: appDom.createConst(dataSourceId),
      },
    });

    onCreated(queryNode);
  }, [dom, input, onCreated]);

  return (
    <Dialog fullWidth open={open} onClose={onClose} scroll="body">
      <DialogTitle>Create Query</DialogTitle>
      <DialogContent>
        <ConnectionSelect sx={{ my: 1 }} value={input} onChange={setInput} />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!input} onClick={handleCreateClick}>
          Create query
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface QueryNodeEditorProps<Q> {
  open: boolean;
  onClose: () => void;
  onSave: (newNode: appDom.QueryNode) => void;
  onRemove: (newNode: appDom.QueryNode) => void;
  node: appDom.QueryNode<Q>;
}

function QueryNodeEditorDialog<Q>({
  open,
  node,
  onClose,
  onRemove,
  onSave,
}: QueryNodeEditorProps<Q>) {
  const { appId } = usePageEditorState();
  const dom = useDom();

  const [input, setInput] = React.useState<appDom.QueryNode<Q>>(node);
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

  const queryModel = React.useMemo<QueryEditorModel<any>>(() => {
    const params =
      (Object.entries(inputParams).filter(([, value]) => Boolean(value)) as BindableAttrEntries) ||
      [];

    return {
      query: input.attributes.query.value,
      // TODO: 'params' are passed only for backwards compatability, eventually we should clean this up
      params,
      parameters: params,
    };
  }, [input.attributes.query.value, inputParams]);

  const handleQueryModelChange = React.useCallback(
    (model: QueryEditorModel<Q>) => {
      onSave(
        update(input, {
          attributes: update(input.attributes, {
            query: appDom.createConst(model.query),
          }),
          params: Object.fromEntries(model.params),
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

  const handleModeChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          mode: appDom.createConst(event.target.value as appDom.FetchMode),
        }),
      }),
    );
  }, []);

  const handleRefetchOnWindowFocusChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput((existing) =>
        update(existing, {
          attributes: update(existing.attributes, {
            refetchOnWindowFocus: appDom.createConst(event.target.checked),
          }),
        }),
      );
    },
    [],
  );

  const handleEnabledChange = React.useCallback((newValue: BindableAttrValue<boolean> | null) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          enabled: newValue || undefined,
        }),
      }),
    );
  }, []);

  const handleRefetchOnReconnectChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput((existing) =>
        update(existing, {
          attributes: update(existing.attributes, {
            refetchOnReconnect: appDom.createConst(event.target.checked),
          }),
        }),
      );
    },
    [],
  );

  const handleRefetchIntervalChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const interval = Number(event.target.value);

      setInput((existing) =>
        update(existing, {
          attributes:
            Number.isNaN(interval) || interval <= 0
              ? omit(existing.attributes, 'refetchInterval')
              : update(existing.attributes, {
                  refetchInterval: appDom.createConst(interval * 1000),
                }),
        }),
      );
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

  const liveEnabled = useEvaluateLiveBinding({
    input: input.attributes.enabled || null,
    globalScope: pageState,
  });

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

  const renderQueryOptions = React.useCallback(() => {
    const mode = input.attributes.mode?.value || 'query';
    return (
      <Stack direction="row" alignItems="center" sx={{ pt: 2, px: 3, gap: 2 }}>
        <TextField select label="mode" value={mode} onChange={handleModeChange}>
          <MenuItem value="query">Fetch at any time to always be available on the page</MenuItem>
          <MenuItem value="mutation">Only fetch on manual action</MenuItem>
        </TextField>
        <BindableEditor
          liveBinding={liveEnabled}
          globalScope={pageState}
          server
          label="Enabled"
          propType={{ type: 'boolean' }}
          value={input.attributes.enabled ?? appDom.createConst(true)}
          onChange={handleEnabledChange}
          disabled={mode !== 'query'}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={input.attributes.refetchOnWindowFocus?.value ?? true}
              onChange={handleRefetchOnWindowFocusChange}
              disabled={mode !== 'query'}
            />
          }
          label="Refetch on window focus"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={input.attributes.refetchOnReconnect?.value ?? true}
              onChange={handleRefetchOnReconnectChange}
              disabled={mode !== 'query'}
            />
          }
          label="Refetch on network reconnect"
        />
        <TextField
          InputProps={{
            startAdornment: <InputAdornment position="start">s</InputAdornment>,
          }}
          sx={{ maxWidth: 300 }}
          type="number"
          label="Refetch interval"
          value={refetchIntervalInSeconds(input.attributes.refetchInterval?.value) ?? ''}
          onChange={handleRefetchIntervalChange}
          disabled={mode !== 'query'}
        />
      </Stack>
    );
  }, [
    input,
    handleModeChange,
    handleEnabledChange,
    handleRefetchIntervalChange,
    handleRefetchOnReconnectChange,
    handleRefetchOnWindowFocusChange,
    liveEnabled,
    pageState,
  ]);

  const renderDialogActions: RenderDialogActions = React.useCallback(
    ({ isDirty, onCommit }) => {
      return (
        <QueryeditorDialogActions
          onCommit={onCommit}
          onClose={handleClose}
          onRemove={handleRemove}
          saveDisabled={isInputSaved && !isDirty}
        />
      );
    },
    [handleClose, handleRemove, isInputSaved],
  );

  const queryEditorShellContext: QueryEditorDialogContext = {
    renderDialogTitle,
    renderQueryOptions,
    renderDialogActions,
  };

  return (
    <QueryEditorDialogContextProvider value={queryEditorShellContext}>
      <Dialog fullWidth maxWidth="xl" open={open} onClose={onClose}>
        {dataSourceId && dataSource && queryEditorContext ? (
          <ConnectionContextProvider value={queryEditorContext}>
            <dataSource.QueryEditor
              QueryEditorShell={QueryEditorShell}
              connectionParams={connectionParams}
              value={queryModel}
              onChange={handleQueryModelChange}
              globalScope={pageState}
            />
          </ConnectionContextProvider>
        ) : (
          <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
        )}
      </Dialog>
    </QueryEditorDialogContextProvider>
  );
}

type DialogState = {
  nodeId?: NodeId;
};

export default function QueryEditor() {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [dialogState, setDialogState] = React.useState<DialogState | null>(null);

  const handleEditStateDialogClose = React.useCallback(() => setDialogState(null), []);

  const page = appDom.getNode(dom, state.nodeId, 'page');
  const { queries = [] } = appDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    setDialogState({});
  }, []);

  const handleCreated = React.useCallback(
    (node: appDom.QueryNode) => {
      domApi.addNode(node, page, 'queries');
      setDialogState({ nodeId: node.id });
    },
    [domApi, page],
  );

  const handleSave = React.useCallback(
    (node: appDom.QueryNode) => {
      domApi.saveNode(node);
    },
    [domApi],
  );

  const handleRemove = React.useCallback(
    (node: appDom.QueryNode) => {
      domApi.removeNode(node.id);
    },
    [domApi],
  );

  const editedNode = dialogState?.nodeId
    ? appDom.getMaybeNode(dom, dialogState.nodeId, 'query')
    : null;

  // To keep it around during closing animation
  const lastEditednode = useLatest(editedNode);

  return (
    <Stack spacing={1} alignItems="start">
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleCreate}>
        Add query
      </Button>
      <List>
        {queries.map((queryNode) => {
          return (
            <ListItem
              key={queryNode.id}
              button
              onClick={() => setDialogState({ nodeId: queryNode.id })}
            >
              {queryNode.name}
            </ListItem>
          );
        })}
      </List>
      {dialogState?.nodeId && lastEditednode ? (
        <QueryNodeEditorDialog
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
