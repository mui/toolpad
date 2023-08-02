import postgres from './postgres/client';
import mysql from './mysql/client';
import rest from './rest/client';
import { ClientDataSource } from '../types';
import googleSheets from './googleSheets/client';
import local from './local/client';

type ClientDataSources = { [key: string]: ClientDataSource<any, any> | undefined };

const dataSources: ClientDataSources = {
  rest,
  postgres,
  googleSheets,
  mysql,
  local,
};

export default dataSources;
