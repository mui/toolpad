import { ServerDataSource } from '../types';
import postgres from './postgres/server';
import mysql from './mysql/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';
import local from './local/server';

type ServerDataSources = { [key: string]: ServerDataSource<any, any, any> | undefined };

export default {
  rest,
  postgres,
  googleSheets,
  mysql,
  local,
} satisfies ServerDataSources;
