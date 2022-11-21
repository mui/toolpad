import * as _ from 'lodash-es';
import functionSrc from './function/client';
import postgres from './postgres/client';
import rest from './rest/client';
import { ClientDataSource } from '../types';
import googleSheets from './googleSheets/client';
import movies from './movies/client';
import config from '../config';
import { DEMO_DATASOURCES, PRODUCTION_DATASOURCES } from '../constants';

type ClientDataSources = { [key: string]: ClientDataSource<any, any> | undefined };

const clientDataSources: ClientDataSources = _.pick(
  {
    rest,
    function: functionSrc,
    postgres,
    googleSheets,
    movies,
  },
  [...PRODUCTION_DATASOURCES, ...(config.isDemo ? DEMO_DATASOURCES : [])],
);

export default clientDataSources;
