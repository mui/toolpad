import { ExecFetchResult } from '@mui/toolpad-core';
import moviesData from '../../../public/static/movies.json';
import { ServerDataSource } from '../../types';
import { Maybe } from '../../utils/types';
import { MoviesConnectionParams, MoviesQuery, Movie } from './types';

async function execBase(
  connection: Maybe<MoviesConnectionParams>,
  moviesQuery: MoviesQuery,
): Promise<ExecFetchResult<Movie[]>> {
  const data = moviesData.movies.filter((movie) =>
    moviesQuery.genre ? movie.genres.includes(moviesQuery.genre) : true,
  );
  return {
    data,
  };
}

async function execPrivate(connection: Maybe<MoviesConnectionParams>, moviesQuery: MoviesQuery) {
  return execBase(connection, moviesQuery);
}

async function exec(
  connection: Maybe<MoviesConnectionParams>,
  moviesQuery: MoviesQuery,
): Promise<ExecFetchResult<Movie[]>> {
  return execBase(connection, moviesQuery);
}

const dataSource: ServerDataSource<MoviesConnectionParams, MoviesQuery, MoviesQuery, Movie[]> = {
  exec,
  execPrivate,
};

export default dataSource;
