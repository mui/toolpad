import { Button, Stack, TextareaAutosize, TextField, Toolbar } from '@mui/material';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import { validation } from '../../utils/forms';
import { Maybe } from '../../utils/types';
import { PostgresConnectionParams, PostgresQuery } from './types';

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
      <Toolbar disableGutters>
        <Button onClick={doSubmit} disabled={!formState.isDirty || !formState.isValid}>
          Save
        </Button>
      </Toolbar>
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
    </Stack>
  );
}

function QueryEditor({
  value,
  onChange,
}: QueryEditorProps<PostgresConnectionParams, PostgresQuery>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange({ ...value, text: event.target.value });
    },
    [value, onChange],
  );
  return (
    <div>
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
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
