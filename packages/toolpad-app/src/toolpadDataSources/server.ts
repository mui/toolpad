import { ServerDataSource } from '../types';
import functionSrc from './function/server';
import postgres from './postgres/server';
import mysql from './mysql/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';
import movies from './movies/server';
import config from '../config';

type ServerDataSources = { [key: string]: ServerDataSource<any, any, any> | undefined };

const serverDataSources: ServerDataSources = config.isDemo
  ? {
      movies,
      rest,
    }
  : {
      postgres,
      function: functionSrc,
      rest,
      googleSheets,
      mysql,
    };

export default serverDataSources;
