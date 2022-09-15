import { Box, Button, MenuItem, Stack, TextField, Toolbar } from '@mui/material';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import data from '../../../movies.json';
import JsonView from '../../components/JsonView';
import SplitPane from '../../components/SplitPane';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import { ClientDataSource, ConnectionEditorProps, QueryEditorProps } from '../../types';
import { Maybe } from '../../utils/types';
import useQueryPreview from '../useQueryPreview';
import { MoviesQuery, MoviesConnectionParams } from './types';
import { FetchResult } from '../rest/types';

function withDefaults(value: Maybe<MoviesConnectionParams>): MoviesConnectionParams {
  return {
    ...value,
  };
}

function ConnectionParamsInput({ value, onChange }: ConnectionEditorProps<MoviesConnectionParams>) {
  const { handleSubmit, reset } = useForm({
    defaultValues: withDefaults(value),
  });
  React.useEffect(() => reset(withDefaults(value)), [reset, value]);

  const doSubmit = handleSubmit((connectionParams) => onChange(connectionParams));

  return (
    <Stack direction="column" gap={1}>
      <Toolbar disableGutters>
        <Button variant="contained" onClick={doSubmit}>
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

  const { preview, runPreview: handleRunPreview } = useQueryPreview<MoviesQuery, FetchResult>({
    genre: value.query.genre,
  });

  const lastSavedInput = React.useRef(input);
  const handleCommit = React.useCallback(() => {
    onChange(input);
    lastSavedInput.current = input;
  }, [onChange, input]);

  const isDirty =
    input.query !== lastSavedInput.current.query || input.params !== lastSavedInput.current.params;

  return (
    <QueryEditorShell onCommit={handleCommit} isDirty={isDirty}>
      <SplitPane split="vertical" size="50%" allowResize>
        <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Toolbar>
            <LoadingButton startIcon={<PlayArrowIcon />} onClick={handleRunPreview}>
              Preview
            </LoadingButton>
          </Toolbar>
          <Box sx={{ px: 3, pt: 1 }}>
            <TextField
              select
              fullWidth
              value={input.query.genre || 'any'}
              label="Genre"
              onChange={handleChange}
            >
              <MenuItem value={'any'}>Any</MenuItem>
              {data.genres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
        {preview?.error ? (
          <ErrorAlert error={preview?.error} />
        ) : (
          <JsonView sx={{ height: '100%' }} src={preview?.data} />
        )}
      </SplitPane>
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
