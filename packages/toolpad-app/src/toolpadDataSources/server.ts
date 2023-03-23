import * as _ from 'lodash-es';
import { ServerDataSource } from '../types';
import postgres from './postgres/server';
import mysql from './mysql/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';
import local from './local/server';

import config from '../server/config';
import { DEMO_DATASOURCES, PRODUCTION_DATASOURCES } from '../constants';

type ServerDataSources = { [key: string]: ServerDataSource<any, any, any> | undefined };

const serverDataSources: ServerDataSources = _.pick(
  {
    rest,
    postgres,
    googleSheets,
    mysql,
    local,
  },
  [...(config.isDemo ? DEMO_DATASOURCES : PRODUCTION_DATASOURCES)],
);

export default serverDataSources;
