import {
  ConnectionStatus,
  StudioConnection,
  StudioDataSourceServer,
  StudioApiResult,
} from '../../types';
import data from '../../../movies.json';
import { MoviesConnectionParams, MoviesQuery, Movie } from './types';

async function test(
  connection: StudioConnection<MoviesConnectionParams>,
): Promise<ConnectionStatus> {
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now(), error: 'Failed to connect. (ERR-123)' };
}

async function exec(
  connection: StudioConnection<MoviesConnectionParams>,
  moviesQuery: MoviesQuery,
): Promise<StudioApiResult<Movie>> {
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
    data: data.movies.filter((movie) =>
      moviesQuery.genre ? movie.genres.includes(moviesQuery.genre) : true,
    ),
  };
}

const dataSource: StudioDataSourceServer<MoviesConnectionParams, MoviesQuery, Movie> = {
  test,
  exec,
};

export default dataSource;
