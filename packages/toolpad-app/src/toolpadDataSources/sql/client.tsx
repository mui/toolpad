import { LoadingButton } from '@mui/lab';
import { Box, Button, Skeleton, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { inferColumns, parseColumns } from '@mui/toolpad-components';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { getObjectKey } from '@mui/toolpad-core/objectKey';
import { BindableAttrEntries, BindableAttrValue } from '@mui/toolpad-core';
import SplitPane from '../../components/SplitPane';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';
import { useEvaluateLiveBindingEntries } from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import { QueryEditorProps } from '../../types';
import { isSaveDisabled, validation } from '../../utils/forms';
import lazyComponent from '../../utils/lazyComponent';
import { Maybe } from '../../utils/types';
import QueryInputPanel from '../QueryInputPanel';
import useFetchPrivate from '../useFetchPrivate';
import useQueryPreview from '../useQueryPreview';
import * as appDom from '../../appDom';
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

function getConnectionStatusIcon(status: SqlConnectionStatus | null): React.ReactNode {
  if (!status) {
    return <SyncIcon />;
  }
  return status.error ? <ErrorOutlineIcon /> : <CheckCircleOutlineIcon />;
}

function getConnectionStatusColor(
  status: SqlConnectionStatus | null,
): 'error' | 'success' | undefined {
  if (!status) {
    return undefined;
  }
  return status.error ? 'error' : 'success';
}

function withDefaults(value: Maybe<SqlConnectionParams>, defaultPort: number): SqlConnectionParams {
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
  const { handleSubmit, register, formState, reset, watch } = useForm({
    defaultValues: withDefaults(value, defaultPort),
    reValidateMode: 'onChange',
    mode: 'all',
  });
  React.useEffect(() => reset(withDefaults(value, defaultPort)), [defaultPort, reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

  const fetchPrivate = useFetchPrivate<SqlPrivateQuery, any>();

  const [connectionStatus, setConnectionStatus] = React.useState<SqlConnectionStatus | null>(null);

  const values = watch();

  const handleTestConnection = React.useCallback(() => {
    fetchPrivate({ kind: 'connectionStatus', params: values })
      .then((status) => {
        setConnectionStatus(status);
      })
      .catch(() => {
        setConnectionStatus(null);
      });
  }, [fetchPrivate, values]);

  const statusIcon = getConnectionStatusIcon(connectionStatus);

  React.useEffect(() => {
    const { unsubscribe } = watch((_values, params) => {
      if (params.type === 'change') {
        setConnectionStatus(null);
      }
    });
    return unsubscribe;
  }, [watch]);

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
          color={getConnectionStatusColor(connectionStatus) || 'inherit'}
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
  value: input,
  onChange: setInput,
}: QueryEditorProps<SqlConnectionParams, SqlQuery>) {
  const paramsEntries = input.params || EMPTY_PARAMS;

  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    input: paramsEntries,
    globalScope,
  });

  const handleParamsChange = React.useCallback(
    (newParams: [string, BindableAttrValue<string>][]) => {
      setInput((existing) => ({ ...existing, params: newParams }));
    },
    [setInput],
  );

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding.value])),
    [paramsEditorLiveValue],
  );

  const fetchPrivate = useFetchPrivate<SqlPrivateQuery, SqlResult>();
  const fetchServerPreview = React.useCallback(
    (query: SqlQuery, params: Record<string, string>) =>
      fetchPrivate({ kind: 'debugExec', query, params }),
    [fetchPrivate],
  );

  const { preview, runPreview: handleRunPreview } = useQueryPreview(
    fetchServerPreview,
    input.attributes.query.value,
    previewParams,
  );

  const rawRows: any[] = preview?.data || EMPTY_ROWS;
  const columns: GridColDef[] = React.useMemo(() => parseColumns(inferColumns(rawRows)), [rawRows]);
  const rows = React.useMemo(() => rawRows.map((row, id) => ({ id, ...row })), [rawRows]);
  const previewGridKey = React.useMemo(() => getObjectKey(columns), [columns]);

  return (
    <SplitPane split="vertical" size="50%" allowResize>
      <SplitPane split="horizontal" size={85} primary="second" allowResize>
        <QueryInputPanel onRunPreview={handleRunPreview}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <MonacoEditor
              value={input.attributes.query.value.sql}
              onChange={(newValue) =>
                setInput((existing) => appDom.setQueryProp(existing, 'sql', newValue))
              }
              language="sql"
            />
          </Box>
        </QueryInputPanel>

        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          <Typography>Parameters</Typography>
          <ParametersEditor
            value={paramsEntries}
            onChange={handleParamsChange}
            globalScope={globalScope}
            liveValue={paramsEditorLiveValue}
          />
        </Box>
      </SplitPane>

      {preview?.error ? (
        <ErrorAlert error={preview?.error} />
      ) : (
        <DataGridPro sx={{ border: 'none' }} columns={columns} key={previewGridKey} rows={rows} />
      )}
    </SplitPane>
  );
}

export function getInitialQueryValue(): SqlQuery {
  return {
    sql: 'SELECT NOW()',
  };
}
