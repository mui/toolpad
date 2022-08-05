import {
  Stack,
  Button,
  Grid,
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
  Toolbar,
  MenuItem,
  IconButton,
  SxProps,
  Alert,
  Box,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { LoadingButton } from '@mui/lab';
import { BindableAttrValue, NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import useLatest from '../../../utils/useLatest';
import { usePageEditorState } from './PageEditorProvider';
import * as appDom from '../../../appDom';
import { QueryEditorModel } from '../../../types';
import dataSources from '../../../toolpadDataSources/client';
import NodeNameEditor from '../NodeNameEditor';
import JsonView from '../../../components/JsonView';
import { omit, update } from '../../../utils/immutability';
import client from '../../../api';
import ErrorAlert from './ErrorAlert';
import { JsExpressionEditor } from './JsExpressionEditor';
import { useEvaluateLiveBinding, useEvaluateLiveBindings } from '../useEvaluateLiveBinding';
import { WithControlledProp } from '../../../utils/types';
import { useDom, useDomApi } from '../../DomLoader';
import { mapValues } from '../../../utils/collections';
import { ConnectionContextProvider } from '../../../toolpadDataSources/context';
import SplitPane from '../../../components/SplitPane';
import BindableEditor from './BindableEditor';

const LEGACY_DATASOURCE_QUERY_EDITOR_LAYOUT = new Set([
  'rest',
  'googleSheets',
  'postgres',
  'movies',
]);

const EMPTY_OBJECT = {};

export interface ConnectionSelectProps extends WithControlledProp<NodeId | null> {
  dataSource?: string;
  sx?: SxProps;
}

export function ConnectionSelect({ sx, dataSource, value, onChange }: ConnectionSelectProps) {
  const dom = useDom();

  const app = appDom.getApp(dom);
  const { connections = [] } = appDom.getChildNodes(dom, app);

  const filtered = React.useMemo(() => {
    return dataSource
      ? connections.filter((connection) => connection.attributes.dataSource.value === dataSource)
      : connections;
  }, [connections, dataSource]);

  const handleSelectionChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange((event.target.value as NodeId) || null);
    },
    [onChange],
  );

  return (
    <TextField
      sx={sx}
      select
      fullWidth
      value={value || ''}
      label="Connection"
      onChange={handleSelectionChange}
    >
      {filtered.map((connection) => (
        <MenuItem key={connection.id} value={connection.id}>
          {connection.name} | {connection.attributes.dataSource.value}
        </MenuItem>
      ))}
    </TextField>
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

  const [input, setInput] = React.useState<NodeId | null>(null);

  const handleClick = React.useCallback(() => {
    const connectionId = input;
    const connection = connectionId && appDom.getMaybeNode(dom, connectionId, 'connection');

    invariant(connection, `Selected non-existing connection "${connectionId}"`);

    const dataSourceId = connection.attributes.dataSource.value;
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
    <Dialog open={open} onClose={onClose} scroll="body">
      <DialogTitle>Create Query</DialogTitle>
      <DialogContent>
        <ConnectionSelect sx={{ my: 1 }} value={input} onChange={setInput} />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!input} onClick={handleClick}>
          Create query
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type RawQueryPreviewKey<Q, P> = [string, appDom.QueryNode<Q, P>, Record<string, any>];

interface QueryNodeEditorProps<Q, P> {
  open: boolean;
  onClose: () => void;
  onSave: (newNode: appDom.QueryNode) => void;
  onRemove: (newNode: appDom.QueryNode) => void;
  node: appDom.QueryNode<Q, P>;
}

function QueryNodeEditorDialog<Q, P>({
  open,
  node,
  onClose,
  onRemove,
  onSave,
}: QueryNodeEditorProps<Q, P>) {
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
  const inputParams = input.params || EMPTY_OBJECT;
  const dataSourceId = input.attributes.dataSource?.value;
  const dataSource = (dataSourceId && dataSources[dataSourceId]) || null;

  const connectionParams = connection?.attributes.params.value;

  const queryModel = React.useMemo(
    () => ({
      query: input.attributes.query.value,
      params: inputParams,
    }),
    [input.attributes.query.value, inputParams],
  );

  const handleQueryModelChange = React.useCallback((model: QueryEditorModel<Q>) => {
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
    input: inputParams,
    globalScope: pageState,
  });

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

  const handleTransformFnChange = React.useCallback((newValue: string) => {
    setInput((existing) =>
      update(existing, {
        attributes: update(existing.attributes, {
          transform: appDom.createConst(newValue),
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

  const handleSave = React.useCallback(() => {
    onSave(input);
  }, [onSave, input]);

  const handleRemove = React.useCallback(() => {
    onRemove(node);
    onClose();
  }, [onRemove, node, onClose]);

  const paramsObject: Record<string, any> = mapValues(
    liveParams,
    (bindingResult) => bindingResult.value,
  );

  const [previewQuery, setPreviewQuery] = React.useState<appDom.QueryNode<Q, P> | null>(null);
  const [previewParams, setPreviewParams] = React.useState(paramsObject);
  const queryPreview = client.useQuery(
    'execQuery',
    previewQuery ? [appId, previewQuery, previewParams] : null,
    { retry: false },
  );

  const isPreviewLoading: boolean = !!previewQuery && queryPreview.isLoading;

  const handleUpdatePreview = React.useCallback(() => {
    setPreviewQuery(input);
    setPreviewParams(paramsObject);
  }, [input, paramsObject]);

  const inputWithTransformDisabled = React.useMemo<appDom.QueryNode<Q, P>>(() => {
    if (input.attributes.transformEnabled?.value) {
      return {
        ...input,
        attributes: {
          ...input.attributes,
          transform: { type: 'const', value: '' },
          refetchOnReconnect: { type: 'const', value: false },
          refetchOnWindowFocus: { type: 'const', value: false },
          refetchInterval: undefined,
          transformEnabled: { type: 'const', value: false },
        },
      };
    }

    return input;
  }, [input]);

  const rawQueryPreviewKey = React.useMemo<RawQueryPreviewKey<Q, P>>(
    () => [appId, inputWithTransformDisabled, previewParams],
    [appId, inputWithTransformDisabled, previewParams],
  );

  const rawQueryPreview = client.useQuery('execQuery', rawQueryPreviewKey, {
    retry: false,
    keepPreviousData: true,
  });

  const handleRawQueryPreviewRefresh = React.useCallback(() => {
    rawQueryPreview.refetch();
  }, [rawQueryPreview]);

  const handleTransformEnabledChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput((existing) =>
        update(existing, {
          attributes: update(existing.attributes, {
            transformEnabled: appDom.createConst(event.target.checked),
          }),
        }),
      );
    },
    [],
  );

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

  const liveEnabled = useEvaluateLiveBinding({
    input: input.attributes.enabled || null,
    globalScope: pageState,
  });

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
              {/* TODO: move transform/preview inside of the dataSource.QueryEditor and remove the legacy conditional */}
              {LEGACY_DATASOURCE_QUERY_EDITOR_LAYOUT.has(dataSourceId) ? (
                <SplitPane split="vertical" allowResize size="50%">
                  <Stack
                    sx={{
                      width: '100%',
                      height: '100%',
                      overflow: 'auto',
                    }}
                  >
                    {/* This is the exact same element as below */}
                    <dataSource.QueryEditor
                      connectionParams={connectionParams}
                      value={queryModel}
                      liveParams={liveParams}
                      onChange={handleQueryModelChange}
                      globalScope={pageState}
                    />

                    <Grid container direction="row" spacing={1} sx={{ px: 3, pb: 1, mt: 2 }}>
                      <React.Fragment>
                        <Divider />
                        <Grid item xs={6} md={12}>
                          <Stack>
                            <FormControlLabel
                              label="Transform response"
                              control={
                                <Checkbox
                                  checked={input.attributes.transformEnabled?.value ?? false}
                                  onChange={handleTransformEnabledChange}
                                  inputProps={{ 'aria-label': 'controlled' }}
                                />
                              }
                            />

                            <Stack direction={'row'} spacing={2} width={'100%'}>
                              <Box
                                sx={{
                                  width: '300px',
                                  maxWidth: '600px',
                                  maxHeight: '150px',
                                  overflow: 'scroll',
                                }}
                              >
                                <JsonView
                                  src={rawQueryPreview.data ?? { data: {} }}
                                  sx={{
                                    opacity:
                                      rawQueryPreview.isRefetching ||
                                      !input.attributes.transformEnabled?.value
                                        ? 0.5
                                        : 1,
                                  }}
                                />
                              </Box>
                              <IconButton
                                disabled={
                                  rawQueryPreview.isFetched ||
                                  !input.attributes.transformEnabled?.value
                                }
                                onClick={handleRawQueryPreviewRefresh}
                                sx={{ alignSelf: 'self-start' }}
                              >
                                <AutorenewIcon
                                  sx={{
                                    animation: 'spin 1500ms linear infinite',
                                    animationPlayState: rawQueryPreview.isRefetching
                                      ? 'running'
                                      : 'paused',
                                    '@keyframes spin': {
                                      '0%': {
                                        transform: 'rotate(0deg)',
                                      },
                                      '100%': {
                                        transform: 'rotate(360deg)',
                                      },
                                    },
                                  }}
                                  fontSize="inherit"
                                />
                              </IconButton>
                              <JsExpressionEditor
                                globalScope={{ data: rawQueryPreview.data?.data }}
                                autoFocus
                                value={input.attributes.transform?.value ?? 'return data;'}
                                sx={{
                                  minWidth: '300px',
                                  opacity: rawQueryPreview.isRefetching ? 0.5 : 1,
                                }}
                                functionBody
                                onChange={handleTransformFnChange}
                                disabled={!input.attributes.transformEnabled?.value}
                              />
                            </Stack>
                          </Stack>
                        </Grid>
                      </React.Fragment>
                    </Grid>
                  </Stack>

                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Toolbar>
                      <LoadingButton
                        disabled={previewParams === paramsObject && previewQuery === input}
                        loading={isPreviewLoading}
                        loadingPosition="start"
                        variant="contained"
                        onClick={handleUpdatePreview}
                        startIcon={<PlayArrowIcon />}
                      >
                        Preview
                      </LoadingButton>
                    </Toolbar>
                    <Box sx={{ flex: 1, minHeight: 0, px: 3, py: 1, overflow: 'auto' }}>
                      {queryPreview.error ? <ErrorAlert error={queryPreview.error} /> : null}
                      {queryPreview.isSuccess ? <JsonView src={queryPreview.data} /> : null}
                    </Box>
                  </Box>
                </SplitPane>
              ) : (
                <dataSource.QueryEditor
                  connectionParams={connectionParams}
                  value={queryModel}
                  liveParams={liveParams}
                  onChange={handleQueryModelChange}
                  globalScope={pageState}
                />
              )}
            </ConnectionContextProvider>
          </Box>

          <Stack direction="row" alignItems="center" sx={{ pt: 2, px: 3, gap: 2 }}>
            <BindableEditor
              liveBinding={liveEnabled}
              globalScope={pageState}
              server
              label="Enabled"
              propType={{ type: 'boolean' }}
              value={input.attributes.enabled ?? null}
              onChange={handleEnabledChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={input.attributes.refetchOnWindowFocus?.value ?? true}
                  onChange={handleRefetchOnWindowFocusChange}
                />
              }
              label="Refetch on window focus"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={input.attributes.refetchOnReconnect?.value ?? true}
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
              type="number"
              label="Refetch interval"
              value={refetchIntervalInSeconds(input.attributes.refetchInterval?.value) ?? ''}
              onChange={handleRefetchIntervalChange}
            />
          </Stack>
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
