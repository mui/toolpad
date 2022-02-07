import movies from './movies/client';
import postgres from './postgres/client';
import rest from './rest/client';
import { StudioDataSourceClient } from './types';

const studioConnections: { [key: string]: StudioDataSourceClient<any, any> | undefined } = {
  movies,
  postgres,
  rest,
};

export default studioConnections;
