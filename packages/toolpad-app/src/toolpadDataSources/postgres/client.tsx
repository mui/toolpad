import { Box, Button, Skeleton, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { inferColumns, parseColumns } from '@mui/toolpad-components';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import SplitPane from '../../components/SplitPane';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import ParametersEditor from '../../toolpad/AppEditor/PageEditor/ParametersEditor';
import { useEvaluateLiveBindingEntries } from '../../toolpad/AppEditor/useEvaluateLiveBinding';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import { isSaveDisabled, validation } from '../../utils/forms';
import lazyComponent from '../../utils/lazyComponent';
import { Maybe } from '../../utils/types';
import QueryInputPanel from '../QueryInputPanel';
import useQueryPreview from '../useQueryPreview';
import {
  PostgresConnectionParams,
  PostgresPrivateQuery,
  PostgresQuery,
  PostgresResult,
} from './types';

const MonacoEditor = lazyComponent(() => import('../../components/MonacoEditor'), {
  noSsr: true,
  fallback: <Skeleton variant="rectangular" height="100%" />,
});

const EMPTY_ROWS: any[] = [];

function isValid(connection: PostgresConnectionParams): boolean {
  return !!(
    connection.host &&
    connection.port &&
    connection.user &&
    connection.password &&
    connection.database &&
    !Number.isNaN(connection.port)
  );
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
  const { handleSubmit, register, formState, reset } = useForm({
    defaultValues: withDefaults(value),
    reValidateMode: 'onChange',
    mode: 'all',
  });
  React.useEffect(() => reset(withDefaults(value)), [reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

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
      <Toolbar disableGutters>
        <Button variant="contained" onClick={doSubmit} disabled={isSaveDisabled(formState)}>
          Save
        </Button>
      </Toolbar>
    </Stack>
  );
}

function QueryEditor({
  QueryEditorShell,
  globalScope,
  value,
  onChange,
}: QueryEditorProps<PostgresConnectionParams, PostgresQuery>) {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const paramsEditorLiveValue = useEvaluateLiveBindingEntries({
    input: input.params,
    globalScope,
  });

  const previewParams = React.useMemo(
    () => Object.fromEntries(paramsEditorLiveValue.map(([key, binding]) => [key, binding.value])),
    [paramsEditorLiveValue],
  );

  const { preview, runPreview: handleRunPreview } = useQueryPreview<
    PostgresPrivateQuery,
    PostgresResult
  >({
    kind: 'debugExec',
    query: input.query,
    params: previewParams,
  });

  const handleCommit = React.useCallback(() => onChange(input), [onChange, input]);

  const isDirty = input !== value;

  const rawRows: any[] = preview?.data || EMPTY_ROWS;
  const columns: GridColDef[] = React.useMemo(() => parseColumns(inferColumns(rawRows)), [rawRows]);
  const rows = React.useMemo(() => rawRows.map((row, id) => ({ id, ...row })), [rawRows]);

  return (
    <QueryEditorShell onCommit={handleCommit} isDirty={isDirty}>
      <SplitPane split="vertical" size="50%" allowResize>
        <SplitPane split="horizontal" size={85} primary="second" allowResize>
          <QueryInputPanel onRunPreview={handleRunPreview}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MonacoEditor
                value={input.query.sql}
                onChange={(newValue) =>
                  setInput((existing) => ({ ...existing, query: { sql: newValue } }))
                }
                language="sql"
              />
            </Box>
          </QueryInputPanel>

          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography>Parameters</Typography>
            <ParametersEditor
              value={input.params}
              onChange={(newParams) => setInput((existing) => ({ ...existing, params: newParams }))}
              globalScope={globalScope}
              liveValue={paramsEditorLiveValue}
            />
          </Box>
        </SplitPane>

        {preview?.error ? (
          <ErrorAlert error={preview?.error} />
        ) : (
          <DataGridPro sx={{ border: 'none' }} columns={columns} rows={rows} />
        )}
      </SplitPane>
    </QueryEditorShell>
  );
}

function getInitialQueryValue(): PostgresQuery {
  return {
    sql: 'SELECT NOW()',
  };
}

const dataSource: ClientDataSource<PostgresConnectionParams, PostgresQuery> = {
  displayName: 'Postgres',
  ConnectionParamsInput,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
