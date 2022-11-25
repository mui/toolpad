import { Box, MenuItem, TextField, Toolbar } from '@mui/material';
import * as React from 'react';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import data from '../../../public/static/movies.json';
import JsonView from '../../components/JsonView';
import SplitPane from '../../components/SplitPane';
import ErrorAlert from '../../toolpad/AppEditor/PageEditor/ErrorAlert';
import { ClientDataSource, QueryEditorProps } from '../../types';
import useQueryPreview from '../useQueryPreview';
import { MoviesQuery, MoviesConnectionParams } from './types';
import { FetchResult } from '../rest/types';
import useFetchPrivate from '../useFetchPrivate';
import * as appDom from '../../appDom';

export function QueryEditor({
  value: input,
  onChange: setInput,
}: QueryEditorProps<MoviesConnectionParams, MoviesQuery>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput((existing) => appDom.setQueryProp(existing, 'genre', event.target.value || null));
    },
    [setInput],
  );

  const fetchPrivate = useFetchPrivate<MoviesQuery, FetchResult>();
  const fetchServerPreview = React.useCallback(
    (query: MoviesQuery) => fetchPrivate(query),
    [fetchPrivate],
  );

  const { preview, runPreview: handleRunPreview } = useQueryPreview(
    fetchServerPreview,
    { genre: input.attributes.query.value.genre },
    {},
  );

  return (
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
            value={input.attributes.query.value.genre || 'any'}
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
  );
}

function getInitialQueryValue(): MoviesQuery {
  return { genre: null };
}

const dataSource: ClientDataSource<MoviesConnectionParams, MoviesQuery> = {
  displayName: 'Movies',
  QueryEditor,
  getInitialQueryValue,
  hasDefault: true,
};

export default dataSource;
