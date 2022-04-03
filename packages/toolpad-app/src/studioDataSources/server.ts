import { DataSourceServer } from '../types';
import movies from './movies/server';
import postgres from './postgres/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';

const studioConnections: { [key: string]: DataSourceServer<any, any, any> | undefined } = {
  movies,
  postgres,
  rest,
  googleSheets,
};

export default studioConnections;
