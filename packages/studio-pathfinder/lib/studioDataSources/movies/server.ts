import {
  ConnectionStatus,
  StudioConnection,
  StudioDataSourceServer,
  StudioQueryResult,
} from '../../types';
import data from '../../../movies.json';
import { MoviesConnectionParams, MoviesQuery, Movie } from './types';

async function test(
  connection: StudioConnection<MoviesConnectionParams>,
): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now(), error: 'Failed to connect. (ERR-123)' };
}

async function query(
  connection: StudioConnection<MoviesConnectionParams>,
  query: MoviesQuery,
): Promise<StudioQueryResult<Movie>> {
  return {
    fields: {
      id: { type: 'string' },
      title: { type: 'string' },
      year: { type: 'string' },
      runtime: { type: 'string' },
      genres: { type: 'string' },
      director: { type: 'string' },
      actors: { type: 'string' },
      plot: { type: 'string' },
      posterUrl: { type: 'string' },
    },
    data: data.movies.filter((movie) => (query.genre ? movie.genres.includes(query.genre) : true)),
  };
}

const dataSource: StudioDataSourceServer<MoviesConnectionParams, MoviesQuery, Movie> = {
  test,
  query,
};

export default dataSource;
