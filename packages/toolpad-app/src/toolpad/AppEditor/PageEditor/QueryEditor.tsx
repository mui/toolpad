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
  InputAdornment,
  Divider,
  Alert,
  Box,
  MenuItem,
  ListItemText,
  IconButton,
  styled,
  ListItemButton,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { BindableAttrValue, NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import clsx from 'clsx';
import useLatest from '../../../utils/useLatest';
import { usePageEditorState } from './PageEditorProvider';
import * as appDom from '../../../appDom';
import dataSources from '../../../toolpadDataSources/client';
import { omit, update } from '../../../utils/immutability';
import { useEvaluateLiveBinding } from '../useEvaluateLiveBinding';
import { useDom, useDomApi } from '../../DomLoader';
import { ConnectionContextProvider } from '../../../toolpadDataSources/context';
import ConnectionSelect, { ConnectionOption } from './ConnectionSelect';
import BindableEditor from './BindableEditor';
import { ConfirmDialog } from '../../../components/SystemDialogs';
import useBoolean from '../../../utils/useBoolean';
import { useNodeNameValidation } from '../HierarchyExplorer/validation';
import useEvent from '../../../utils/useEvent';
import NodeMenu from '../NodeMenu';

interface QueryeditorDialogActionsProps {
  saveDisabled?: boolean;
  onSave?: () => void;
  onRemove?: () => void;
  onClose?: () => void;
}

function QueryeditorDialogActions({
  saveDisabled,
  onSave,
  onRemove,
  onClose,
}: QueryeditorDialogActionsProps) {
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
      }
    },
    [handleRemoveConfirmclose, onRemove],
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
      <Button disabled={saveDisabled} onClick={onSave}>
        Save
      </Button>
    </DialogActions>
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
  isDraft: boolean;
}

function QueryNodeEditorDialog<Q>({
  open,
  node: nodeProp,
  onClose,
  onRemove,
  onSave,
  isDraft,
}: QueryNodeEditorProps<Q>) {
  const { appId } = usePageEditorState();
  const dom = useDom();

  // To keep it around during closing animation
  const node = useLatest(nodeProp);

  const [input, setInput] = React.useState<appDom.QueryNode<Q>>(node);

  const reset = useEvent(() => setInput(node));

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const connectionId = input.attributes.connectionId.value
    ? appDom.deref(input.attributes.connectionId.value)
    : null;
  const connection = connectionId ? appDom.getMaybeNode(dom, connectionId, 'connection') : null;
  const dataSourceId = input.attributes.dataSource?.value || null;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const connectionParams = connection?.attributes.params.value;

  const handleCommit = React.useCallback(() => {
    let toCommit: appDom.QueryNode<Q> = input;
    if (dataSource?.transformQueryBeforeCommit) {
      toCommit = {
        ...input,
        attributes: {
          ...input.attributes,
          query: appDom.createConst(
            dataSource.transformQueryBeforeCommit(input.attributes.query.value),
          ),
        },
      };
    }
    onSave(toCommit);
  }, [dataSource, input, onSave]);

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

  const handleEnabledChange = React.useCallback((newValue: BindableAttrValue<boolean> | null) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          enabled: newValue || undefined,
        }),
      }),
    );
  }, []);

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

  const isInputSaved = !isDraft && node === input;

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

  const handleSave = React.useCallback(() => {
    handleCommit();
    onClose();
  }, [handleCommit, onClose]);

  const queryEditorContext = React.useMemo(
    () => (dataSourceId ? { appId, dataSourceId, connectionId } : null),
    [appId, dataSourceId, connectionId],
  );

  const liveEnabled = useEvaluateLiveBinding({
    input: input.attributes.enabled || null,
    globalScope: pageState,
  });

  const mode = input.attributes.mode?.value || 'query';

  const existingNames = React.useMemo(
    () => appDom.getExistingNamesForNode(dom, input),
    [dom, input],
  );

  const nodeNameError = useNodeNameValidation(input.name, existingNames, 'query');
  const isNameValid = !nodeNameError;

  return (
    <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
      {dataSourceId && dataSource && queryEditorContext ? (
        <ConnectionContextProvider value={queryEditorContext}>
          <DialogTitle>
            <Stack direction="row" gap={2}>
              <TextField
                required
                autoFocus
                fullWidth
                label="name"
                value={input.name}
                onChange={(event) =>
                  setInput((existing) => ({ ...existing, name: event.target.value }))
                }
                error={!isNameValid}
                helperText={nodeNameError}
              />
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
              <dataSource.QueryEditor
                connectionParams={connectionParams}
                value={input}
                onChange={setInput}
                onCommit={handleCommit}
                globalScope={pageState}
              />
            </Box>

            <Stack direction="row" alignItems="center" sx={{ pt: 2, px: 3, gap: 2 }}>
              <TextField select label="mode" value={mode} onChange={handleModeChange}>
                <MenuItem value="query">
                  Fetch at any time to always be available on the page
                </MenuItem>
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
          </DialogContent>

          <QueryeditorDialogActions
            onSave={handleSave}
            onClose={handleClose}
            onRemove={handleRemove}
            saveDisabled={isInputSaved || !isNameValid}
          />
        </ConnectionContextProvider>
      ) : (
        <Alert severity="error">Datasource &quot;{dataSourceId}&quot; not found</Alert>
      )}
    </Dialog>
  );
}

const classes = {
  listItemMenuButton: 'Toolpad__QueryListItem',
  listItemMenuOpen: 'Toolpad__QueryListItemMenuOpen',
};

const QueryListItem = styled(ListItem)({
  [`& .${classes.listItemMenuButton}`]: {
    visibility: 'hidden',
  },
  [`
    &:hover .${classes.listItemMenuButton}, 
    & .${classes.listItemMenuOpen}
  `]: {
    visibility: 'visible',
  },
});

type DialogState =
  | {
      node?: undefined;
      isDraft?: undefined;
    }
  | {
      node: appDom.QueryNode;
      isDraft: boolean;
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
    (node: appDom.QueryNode) => setDialogState({ node, isDraft: true }),
    [],
  );

  const handleSave = React.useCallback(
    (node: appDom.QueryNode) => {
      if (appDom.nodeExists(dom, node.id)) {
        domApi.saveNode(node);
      } else {
        domApi.addNode(node, page, 'queries');
      }
      setDialogState({ node, isDraft: false });
    },
    [dom, domApi, page],
  );

  const handleDeleteNode = React.useCallback(
    (nodeId: NodeId) => {
      domApi.removeNode(nodeId);
      handleEditStateDialogClose();
    },
    [domApi, handleEditStateDialogClose],
  );

  const handleRemove = React.useCallback(
    (node: appDom.QueryNode) => handleDeleteNode(node.id),
    [handleDeleteNode],
  );

  const handleDuplicateNode = React.useCallback(
    (nodeId: NodeId) => {
      const node = appDom.getNode(dom, nodeId, 'query');
      invariant(
        page,
        'handleDuplicateNode should only be used for queries, which should always belong to a page',
      );
      const existingNames = appDom.getExistingNamesForChildren(dom, page);
      const newName = appDom.proposeName(node.name, existingNames);
      const copy = appDom.createNode(dom, 'query', { ...node, name: newName });
      setDialogState({ node: copy, isDraft: true });
    },
    [dom, page],
  );

  return (
    <Stack spacing={1} alignItems="start" sx={{ width: '100%' }}>
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleCreate}>
        Add query
      </Button>
      <List sx={{ width: '100%' }}>
        {queries.map((queryNode) => {
          return (
            <QueryListItem
              key={queryNode.id}
              disablePadding
              onClick={() => setDialogState({ node: queryNode, isDraft: false })}
              secondaryAction={
                <NodeMenu
                  renderButton={({ buttonProps, menuProps }) => (
                    <IconButton
                      className={clsx(classes.listItemMenuButton, {
                        [classes.listItemMenuOpen]: menuProps.open,
                      })}
                      edge="end"
                      aria-label="Open query menu"
                      {...buttonProps}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                  nodeId={queryNode.id}
                  deleteLabelText={`Delete ${queryNode.name}`}
                  duplicateLabelText={`Duplicate ${queryNode.name}`}
                  onDeleteNode={handleDeleteNode}
                  onDuplicateNode={handleDuplicateNode}
                />
              }
            >
              <ListItemButton>
                <ListItemText primaryTypographyProps={{ noWrap: true }} primary={queryNode.name} />
              </ListItemButton>
            </QueryListItem>
          );
        })}
      </List>
      {dialogState?.node ? (
        <QueryNodeEditorDialog
          open={!!dialogState}
          node={dialogState.node}
          isDraft={dialogState.isDraft}
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
