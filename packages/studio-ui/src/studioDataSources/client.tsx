import { StudioDataSourceClient } from '../types';
import movies from './movies/client';
import postgres from './postgres/client';

const studioConnections: { [key: string]: StudioDataSourceClient<any, any> | undefined } = {
  movies,
  postgres,
};

export default studioConnections;
