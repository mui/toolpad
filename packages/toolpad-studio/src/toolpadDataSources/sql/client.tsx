import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { inferColumns, parseColumns } from '@toolpad/studio-components';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { getObjectKey } from '@toolpad/utils/objectKey';
import { BindableAttrEntries, BindableAttrValue, ExecFetchResult } from '@toolpad/studio-runtime';
import { useBrowserJsRuntime } from '@toolpad/studio-runtime/jsBrowserRuntime';
import { serializeError, errorFrom } from '@toolpad/utils/errors';
import { Maybe } from '@toolpad/utils/types';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { Panel, PanelGroup, PanelResizeHandle } from '../../components/resizablePanels';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';
import { useEvaluateLiveBindingEntries } from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import { QueryEditorProps } from '../../types';
import { isSaveDisabled, validation } from '../../utils/forms';
import lazyComponent from '../../utils/lazyComponent';
import QueryInputPanel from '../QueryInputPanel';
import useFetchPrivate from '../useFetchPrivate';
import useQueryPreview from '../useQueryPreview';
import {
  SqlConnectionStatus,
  SqlConnectionParams,
  SqlConnectionEditorProps,
  SqlQuery,
  SqlPrivateQuery,
  SqlResult,
} from './types';

const MonacoEditor = lazyComponent(() => import('../../components/MonacoEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

const EMPTY_ROWS: any[] = [];

function getConnectionStatusIcon(response: SqlConnectionStatus): React.ReactNode {
  if (response.status === 'connecting' || response.status === 'disconnected') {
    return (
      <SyncIcon
        sx={{
          animation: 'spin 1000ms linear infinite',
          animationPlayState: response?.status === 'connecting' ? 'running' : 'paused',
          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        }}
      />
    );
  }
  return response.status === 'error' ? <ErrorOutlineIcon /> : <CheckCircleOutlineIcon />;
}

function getConnectionStatusColor(response: SqlConnectionStatus) {
  if (response.status === 'connecting' || response.status === 'disconnected') {
    return 'inherit';
  }
  return response.status;
}

function withDefaults(
  value: Maybe<Partial<SqlConnectionParams>>,
  defaultPort: number,
): SqlConnectionParams {
  return {
    host: '',
    user: '',
    password: '',
    database: '',
    port: defaultPort,
    ...value,
  };
}

export function ConnectionParamsInput({
  value,
  onChange,
  defaultPort,
}: SqlConnectionEditorProps<SqlConnectionParams>) {
  const { handleSubmit, register, formState, reset, watch } = useForm<SqlConnectionParams>({
    defaultValues: withDefaults(value, defaultPort),
    reValidateMode: 'onChange',
    mode: 'all',
  });

  React.useEffect(() => reset(withDefaults(value, defaultPort)), [defaultPort, reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

  const fetchPrivate = useFetchPrivate<
    SqlPrivateQuery<SqlConnectionParams, SqlQuery>,
    ExecFetchResult
  >();

  const [connectionStatus, setConnectionStatus] = React.useState<SqlConnectionStatus>({
    status: 'disconnected',
  });

  const values = watch();

  const handleTestConnection = React.useCallback(() => {
    setConnectionStatus({ status: 'connecting' });
    fetchPrivate({ kind: 'connectionStatus', params: withDefaults(values, defaultPort) })
      .then((response) => {
        setConnectionStatus(response.data);
      })
      .catch((rawError) => {
        const error = serializeError(errorFrom(rawError));
        setConnectionStatus({ status: 'error', error: error.message });
      });
  }, [fetchPrivate, values, defaultPort]);

  const statusIcon = getConnectionStatusIcon(connectionStatus);

  const statusColor = getConnectionStatusColor(connectionStatus);

  return (
    <Stack direction="column" gap={1}>
      <TextField
        label="host"
        {...register('host', { required: true })}
        {...validation(formState, 'host')}
      />
      <TextField
        label="port"
        {...register('port', { required: true })}
        {...validation(formState, 'port')}
      />
      <TextField
        label="user"
        {...register('user', { required: true })}
        {...validation(formState, 'user')}
      />
      <TextField
        label="password"
        type="password"
        {...register('password', { required: true })}
        {...validation(formState, 'password')}
      />
      <TextField
        label="database"
        {...register('database', { required: true })}
        {...validation(formState, 'database')}
      />
      <Toolbar disableGutters sx={{ gap: 1 }}>
        <Button variant="contained" onClick={doSubmit} disabled={isSaveDisabled(formState)}>
          Save
        </Button>
        <LoadingButton
          variant="outlined"
          onClick={handleTestConnection}
          disabled={!formState.isValid}
          loadingPosition="end"
          endIcon={statusIcon}
          color={statusColor}
        >
          Test connection
        </LoadingButton>
      </Toolbar>
      {connectionStatus ? (
        <Typography variant="body2" color="error">
          {connectionStatus.error}
        </Typography>
      ) : null}
    </Stack>
  );
}

const EMPTY_PARAMS: BindableAttrEntries = [];

export function QueryEditor({
  globalScope,
  globalScopeMeta,
  value: input,
  onChange: setInput,
}: QueryEditorProps<SqlConnectionParams, SqlQuery>) {
  const paramsEntries = input.params || EMPTY_PARAMS;

  const jsBrowserRuntime = useBrowserJsRuntime();
  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    jsRuntime: jsBrowserRuntime,
    input: paramsEntries,
    globalScope,
  });

  const handleParamsChange = React.useCallback(
    (newParams: [string, BindableAttrValue<string>][]) => {
      setInput?.((existing) => ({ ...existing, params: newParams }));
    },
    [setInput],
  );

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding.value])),
    [paramsEditorLiveValue],
  );

  const fetchPrivate = useFetchPrivate<SqlPrivateQuery<SqlConnectionParams, SqlQuery>, SqlResult>();
  const fetchServerPreview = React.useCallback(
    async (query: SqlQuery, params: Record<string, string>) =>
      fetchPrivate({ kind: 'debugExec', query, params }),
    [fetchPrivate],
  );

  const {
    preview,
    runPreview: handleRunPreview,
    isLoading: previewIsLoading,
  } = useQueryPreview(
    fetchServerPreview,
    input.attributes.query,
    previewParams as Record<string, string>,
  );

  const rawRows: any[] = preview?.data || EMPTY_ROWS;
  const columns: GridColDef[] = React.useMemo(() => parseColumns(inferColumns(rawRows)), [rawRows]);
  const rows = React.useMemo(() => rawRows.map((row, id) => ({ id, ...row })), [rawRows]);
  const previewGridKey = React.useMemo(() => getObjectKey(columns), [columns]);

  return (
    <PanelGroup autoSaveId="toolpad/sql-panel" direction="horizontal">
      <Panel id="sql-query-left" defaultSize={50}>
        <PanelGroup autoSaveId="toolpad/sql/params-tools-split" direction="vertical">
          <Panel defaultSize={85}>
            <QueryInputPanel onRunPreview={handleRunPreview}>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <MonacoEditor
                  value={input.attributes.query.sql}
                  onChange={(newValue) =>
                    setInput?.((existing) => appDom.setQueryProp(existing, 'sql', newValue))
                  }
                  language="sql"
                />
              </Box>
            </QueryInputPanel>
          </Panel>
          <PanelResizeHandle>
            <Divider
              orientation="vertical"
              sx={{
                borderRightWidth: 'medium',
              }}
            />
          </PanelResizeHandle>
          <Panel defaultSize={15}>
            <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography>Parameters</Typography>
              <ParametersEditor
                value={paramsEntries}
                onChange={handleParamsChange}
                globalScope={globalScope}
                globalScopeMeta={globalScopeMeta}
                liveValue={paramsEditorLiveValue}
                jsRuntime={jsBrowserRuntime}
              />
            </Box>
          </Panel>
        </PanelGroup>
      </Panel>
      <Panel id="sql-query-right" defaultSize={50}>
        <Box
          sx={{
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {preview?.error ? (
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="error">{preview?.error?.message}</Typography>
            </Box>
          ) : (
            <React.Fragment>
              <DataGridPremium
                sx={{ border: 'none', flex: 1 }}
                columns={columns}
                key={previewGridKey}
                rows={rows}
                loading={previewIsLoading}
              />
              {preview?.info ? (
                <Typography variant="body2" sx={{ m: 1 }}>
                  {preview.info}
                </Typography>
              ) : null}
            </React.Fragment>
          )}
        </Box>
      </Panel>
    </PanelGroup>
  );
}

export function getInitialQueryValue(): SqlQuery {
  return {
    sql: 'SELECT NOW()',
  };
}
