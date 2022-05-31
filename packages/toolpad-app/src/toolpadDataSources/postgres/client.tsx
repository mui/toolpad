import { Button, Stack, TextareaAutosize, TextField, Toolbar } from '@mui/material';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { ClientDataSource, QueryEditorProps } from '../../types';
import { WithControlledProp } from '../../utils/types';
import { PostgresConnectionParams, PostgresQuery } from './types';

function getInitialValue(): PostgresConnectionParams {
  return {
    host: '',
    port: 5432,
    user: '',
    password: '',
    database: '',
  };
}

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

function ConnectionParamsInput({ value, onChange }: WithControlledProp<PostgresConnectionParams>) {
  const { handleSubmit, register, formState, reset } = useForm({
    defaultValues: value,
  });

  const doSubmit = handleSubmit((connectionParams) => {
    onChange(connectionParams);
    reset(connectionParams);
  });

  return (
    <Stack direction="column" gap={1}>
      <Toolbar disableGutters>
        <Button onClick={doSubmit} disabled={!formState.isDirty}>
          Save
        </Button>
      </Toolbar>
      <TextField size="small" label="host" {...register('host')} />
      <TextField size="small" label="port" {...register('port')} />
      <TextField size="small" label="user" {...register('user')} />
      <TextField size="small" label="password" type="password" {...register('password')} />
      <TextField size="small" label="database" {...register('database')} />
    </Stack>
  );
}

function QueryEditor({ value, onChange, api }: QueryEditorProps<PostgresQuery>) {
  const result = useQuery('getAllTables', () => api.fetchPrivate('getAllTables'));
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange({ ...value, text: event.target.value });
    },
    [value, onChange],
  );
  return (
    <div>
      <div>{JSON.stringify(result.data, null, 2)}</div>
      <TextareaAutosize
        maxRows={4}
        value={value.text}
        onChange={handleChange}
        style={{ width: 200 }}
      />
    </div>
  );
}

function getInitialQueryValue(): PostgresQuery {
  return {
    text: '',
    params: [],
  };
}

const dataSource: ClientDataSource<PostgresConnectionParams, PostgresQuery> = {
  displayName: 'Postgres',
  ConnectionParamsInput,
  getInitialConnectionValue: getInitialValue,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
