import moviesData from '../../../movies.json';
import { LegacyConnection, ConnectionStatus, ApiResult, DataSourceServer } from '../../types';
import { MoviesConnectionParams, MoviesQuery, Movie } from './types';

async function test(
  connection: LegacyConnection<MoviesConnectionParams>,
): Promise<ConnectionStatus> {
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now(), error: 'Failed to connect. (ERR-123)' };
}

async function exec(
  connection: LegacyConnection<MoviesConnectionParams>,
  moviesQuery: MoviesQuery,
): Promise<ApiResult<Movie[]>> {
  const data = moviesData.movies.filter((movie) =>
    moviesQuery.genre ? movie.genres.includes(moviesQuery.genre) : true,
  );
  return {
    data,
  };
}

const dataSource: DataSourceServer<MoviesConnectionParams, MoviesQuery, Movie[]> = {
  test,
  exec,
};

export default dataSource;
