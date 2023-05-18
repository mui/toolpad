import * as _ from 'lodash-es';
import postgres from './postgres/client';
import mysql from './mysql/client';
import rest from './rest/client';
import { ClientDataSource } from '../types';
import googleSheets from './googleSheets/client';
import local from './local/client';
import { PRODUCTION_DATASOURCES } from '../constants';

type ClientDataSources = { [key: string]: ClientDataSource<any, any> | undefined };

export const allClientDataSources: ClientDataSources = {
  rest,
  postgres,
  googleSheets,
  mysql,
  local,
};

const clientDataSources = _.pick(allClientDataSources, [...PRODUCTION_DATASOURCES]);

export default clientDataSources;
