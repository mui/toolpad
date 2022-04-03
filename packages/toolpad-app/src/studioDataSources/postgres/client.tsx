import { Stack, TextareaAutosize, TextField } from '@mui/material';
import * as React from 'react';
import { useQuery } from 'react-query';
import { DataSourceClient, QueryEditorProps } from '../../types';
import { useInput } from '../../utils/forms';
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
  const hostInputProps = useInput(value, onChange, 'host');
  const portInputProps = useInput(value, onChange, 'port');
  const userInputProps = useInput(value, onChange, 'user');
  const passwordInputProps = useInput(value, onChange, 'password');
  const databaseInputProps = useInput(value, onChange, 'database');

  return (
    <Stack direction="column" gap={1}>
      <TextField size="small" label="host" {...hostInputProps} />
      <TextField size="small" label="port" {...portInputProps} />
      <TextField size="small" label="user" {...userInputProps} />
      <TextField size="small" label="password" type="password" {...passwordInputProps} />
      <TextField size="small" label="database" {...databaseInputProps} />
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

const dataSource: DataSourceClient<PostgresConnectionParams, PostgresQuery> = {
  displayName: 'Postgres',
  ConnectionParamsInput,
  getInitialConnectionValue: getInitialValue,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
