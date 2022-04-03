import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import * as React from 'react';
import data from '../../../movies.json';
import { DataSourceClient } from '../../types';
import { useInput } from '../../utils/forms';
import { WithControlledProp } from '../../utils/types';
import { MoviesQuery, MoviesConnectionParams } from './types';

function ConnectionParamsInput({ value, onChange }: WithControlledProp<MoviesConnectionParams>) {
  const apiKeyInputProps = useInput(value, onChange, 'apiKey');

  return (
    <Stack direction="column" gap={1}>
      <TextField size="small" label="API key" {...apiKeyInputProps} />
    </Stack>
  );
}

function getInitialValue(): MoviesConnectionParams {
  return {
    apiKey: '',
  };
}

function isValid(connection: MoviesConnectionParams): boolean {
  return !!connection.apiKey;
}

export function QueryEditor({ value, onChange }: WithControlledProp<MoviesQuery>) {
  const handleChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      onChange({ ...value, genre: event.target.value || null });
    },
    [value, onChange],
  );
  return (
    <Stack>
      <FormControl size="small" fullWidth>
        <InputLabel id="select-movie-genre">Genre</InputLabel>
        <Select
          labelId="select-movie-genre"
          value={value.genre || ''}
          label="Genre"
          onChange={handleChange}
        >
          <MenuItem value={''}>Any</MenuItem>
          {data.genres.map((genre) => (
            <MenuItem key={genre} value={genre}>
              {genre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

function getInitialQueryValue(): MoviesQuery {
  return { genre: null };
}

const dataSource: DataSourceClient<MoviesConnectionParams, MoviesQuery> = {
  displayName: 'Fake Movies API',
  ConnectionParamsInput,
  getInitialConnectionValue: getInitialValue,
  isConnectionValid: isValid,
  QueryEditor,
  getInitialQueryValue,
};

export default dataSource;
