import { ServerDataSource } from '../types';
import functionSrc from './function/server';
import postgres from './postgres/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';
import movies from './movies/server';

type ServerDataSources = { [key: string]: ServerDataSource<any, any, any> | undefined };

const serverDataSources: ServerDataSources = process.env.TOOLPAD_DEMO
  ? {
      movies,
      rest,
    }
  : {
      postgres,
      function: functionSrc,
      rest,
      googleSheets,
    };

export default serverDataSources;
