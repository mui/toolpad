import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Skeleton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { inferColumns, parseColumns } from '@mui/toolpad-components';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { getObjectKey } from '@mui/toolpad-core/objectKey';
import { BindableAttrEntries, BindableAttrValue } from '@mui/toolpad-core';
import SplitPane from '../../components/SplitPane';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';
import { useEvaluateLiveBindingEntries } from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import {
  ClientDataSource,
  ConnectionEditorProps,
  GlobalConnectionEditorProps,
  QueryEditorProps,
} from '../../types';
import { isSaveDisabled, validation } from '../../utils/forms';
import lazyComponent from '../../utils/lazyComponent';
import { Maybe } from '../../utils/types';
import QueryInputPanel from '../QueryInputPanel';
import useFetchPrivate from '../useFetchPrivate';
import useQueryPreview from '../useQueryPreview';
import {
  PostgresConnectionParams,
  PostgresConnectionStatus,
  PostgresPrivateQuery,
  PostgresQuery,
  PostgresResult,
} from './types';
import * as appDom from '../../appDom';
import { useGlobalConnectionFetchPrivate } from '../context';
import SecretTextField from '../SecretTextField';

const MonacoEditor = lazyComponent(() => import('../../components/MonacoEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

const EMPTY_ROWS: any[] = [];

function getConnectionStatusIcon(status: PostgresConnectionStatus | null): React.ReactNode {
  if (!status) {
    return <SyncIcon />;
  }
  return status.error ? <ErrorOutlineIcon /> : <CheckCircleOutlineIcon />;
}

function getConnectionStatusColor(
  status: PostgresConnectionStatus | null,
): 'error' | 'success' | undefined {
  if (!status) {
    return undefined;
  }
  return status.error ? 'error' : 'success';
}

function withDefaults(value: Maybe<PostgresConnectionParams>): PostgresConnectionParams {
  return {
    host: '',
    port: 5432,
    user: '',
    password: '',
    database: '',
    ...value,
  };
}

function ConnectionParamsInput({
  value,
  onChange,
}: ConnectionEditorProps<PostgresConnectionParams>) {
  const { handleSubmit, register, formState, reset, watch } = useForm({
    defaultValues: withDefaults(value),
    reValidateMode: 'onChange',
    mode: 'all',
  });
  React.useEffect(() => reset(withDefaults(value)), [reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

  const fetchPrivate = useFetchPrivate<PostgresPrivateQuery, any>();

  const [connectionStatus, setConnectionStatus] = React.useState<PostgresConnectionStatus | null>(
    null,
  );

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

function GlobalConnectionParamsInput({
  value,
  onChange,
  onClose,
}: GlobalConnectionEditorProps<PostgresConnectionParams>) {
  const { handleSubmit, register, formState, reset, watch, control } = useForm({
    defaultValues: value,
    reValidateMode: 'onChange',
    mode: 'all',
  });
  React.useEffect(() => reset(value), [reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

  const fetchPrivate = useGlobalConnectionFetchPrivate<PostgresPrivateQuery, any>();

  const [connectionStatus, setConnectionStatus] = React.useState<PostgresConnectionStatus | null>(
    null,
  );

  const input = watch();

  const handleTestConnection = React.useCallback(() => {
    fetchPrivate({ kind: 'connectionStatus2', value: input })
      .then((status) => {
        setConnectionStatus(status);
      })
      .catch(() => {
        setConnectionStatus(null);
      });
  }, [fetchPrivate, input]);

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
    <React.Fragment>
      <DialogContent>
        <Stack direction="column" sx={{ gap: 1 }}>
          <TextField
            label="name"
            {...register('name', { required: true })}
            {...validation(formState, 'name')}
          />
          <TextField
            label="host"
            {...register('params.host', { required: true })}
            {...validation(formState, 'params.host')}
          />
          <TextField
            label="port"
            type="number"
            {...register('params.port', { required: true })}
            {...validation(formState, 'params.port')}
          />
          <TextField
            label="user"
            {...register('params.user', { required: true })}
            {...validation(formState, 'params.user')}
          />
          <Controller
            name="secrets.password"
            control={control}
            render={({ field: { value: fieldValue, onChange: onFieldChange, ref } }) => {
              return (
                <SecretTextField
                  ref={ref}
                  label="password"
                  type="password"
                  value={fieldValue}
                  onChange={(newValue) => onFieldChange(newValue)}
                />
              );
            }}
          />
          <TextField
            label="database"
            {...register('params.database', { required: true })}
            {...validation(formState, 'params.database')}
          />
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
          {connectionStatus ? (
            <Typography variant="body2" color="error">
              {connectionStatus.error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        {onClose ? (
          <Button color="inherit" variant="text" onClick={onClose}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" onClick={doSubmit} disabled={!formState.isValid}>
          Save
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

const EMPTY_PARAMS: BindableAttrEntries = [];

function QueryEditor({
  globalScope,
  value: input,
  onChange: setInput,
}: QueryEditorProps<PostgresConnectionParams, PostgresQuery>) {
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

  const fetchPrivate = useFetchPrivate<PostgresPrivateQuery, PostgresResult>();
  const fetchServerPreview = React.useCallback(
    (query: PostgresQuery, params: Record<string, string>) =>
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

function getInitialQueryValue(): PostgresQuery {
  return {
    sql: 'SELECT NOW()',
  };
}

const dataSource: ClientDataSource<PostgresConnectionParams, PostgresQuery> = {
  displayName: 'PostgreSQL',
  ConnectionParamsInput,
  GlobalConnectionParamsInput,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
