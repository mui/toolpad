import { ServerDataSource } from '../types';
import functionSrc from './function/server';
import postgres from './postgres/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';
import movies from './movies/server';

import config from '../server/config';

type ServerDataSources = { [key: string]: ServerDataSource<any, any, any> | undefined };

const serverDataSources: ServerDataSources = config.isDemo
  ? {
      rest,
      function: functionSrc,
      movies,
    }
  : {
      postgres,
      rest,
      function: functionSrc,
      googleSheets,
    };

export default serverDataSources;
