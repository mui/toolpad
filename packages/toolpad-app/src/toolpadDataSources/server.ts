import { ServerDataSource } from '../types';
import movies from './movies/server';
// import postgres from './postgres/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';

type ServerDataSources = { [key: string]: ServerDataSource<any, any, any> | undefined };

const serverDataSources: ServerDataSources = process.env.TOOLPAD_DEMO
  ? {
      movies,
    }
  : {
      // postgres,
      rest,
      googleSheets,
    };

export default serverDataSources;
