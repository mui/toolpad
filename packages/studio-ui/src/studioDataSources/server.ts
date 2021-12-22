import { StudioDataSourceServer } from '../types';
import movies from './movies/server';
import postgres from './postgres/server';

const studioConnections: { [key: string]: StudioDataSourceServer<any, any, any> | undefined } = {
  movies,
  postgres,
};

export default studioConnections;
