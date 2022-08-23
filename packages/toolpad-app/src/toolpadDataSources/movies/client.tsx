import { Button, MenuItem, Stack, TextField, Toolbar } from '@mui/material';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import data from '../../../movies.json';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import { isSaveDisabled, validation } from '../../utils/forms';
import { Maybe } from '../../utils/types';
import { MoviesQuery, MoviesConnectionParams } from './types';

function withDefaults(value: Maybe<MoviesConnectionParams>): MoviesConnectionParams {
  return {
    apiKey: '',
    ...value,
  };
}

function ConnectionParamsInput({ value, onChange }: ConnectionEditorProps<MoviesConnectionParams>) {
  const { handleSubmit, register, formState, reset } = useForm({
    defaultValues: withDefaults(value),
  });
  React.useEffect(() => reset(withDefaults(value)), [reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

  return (
    <Stack direction="column" gap={1}>
      <TextField
        label="API key"
        {...register('apiKey', { required: true })}
        {...validation(formState, 'apiKey')}
      />
      <Toolbar disableGutters>
        <Button variant="contained" onClick={doSubmit} disabled={isSaveDisabled(formState)}>
          Save
        </Button>
      </Toolbar>
    </Stack>
  );
}

export function QueryEditor({
  value,
  onChange,
  QueryEditorShell,
}: QueryEditorProps<MoviesConnectionParams, MoviesQuery>) {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInput((existing) => ({
      ...existing,
      query: { ...existing.query, genre: event.target.value || null },
    }));
  }, []);

  const lastSavedInput = React.useRef(input);
  const handleCommit = React.useCallback(() => {
    onChange(input);
    lastSavedInput.current = input;
  }, [onChange, input]);

  const isDirty =
    input.query !== lastSavedInput.current.query || input.params !== lastSavedInput.current.params;

  return (
    <QueryEditorShell onCommit={handleCommit} isDirty={isDirty}>
      <Stack>
        <TextField
          select
          fullWidth
          value={value.query.genre || ''}
          label="Genre"
          onChange={handleChange}
        >
          <MenuItem value={''}>Any</MenuItem>
          {data.genres.map((genre) => (
            <MenuItem key={genre} value={genre}>
              {genre}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </QueryEditorShell>
  );
}

function getInitialQueryValue(): MoviesQuery {
  return { genre: null };
}

const dataSource: ClientDataSource<MoviesConnectionParams, MoviesQuery> = {
  displayName: 'Fake Movies API',
  ConnectionParamsInput,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
