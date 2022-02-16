import { StudioDataSourceServer } from '../types';
import movies from './movies/server';
import postgres from './postgres/server';
import rest from './rest/server';

const studioConnections: { [key: string]: StudioDataSourceServer<any, any, any> | undefined } = {
  movies,
  postgres,
  rest,
};

export default studioConnections;
