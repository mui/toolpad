import * as _ from 'lodash-es';
import functionSrc from './function/client';
import postgres from './postgres/client';
import rest from './rest/client';
import { ClientDataSource } from '../types';
import googleSheets from './googleSheets/client';
import config from '../config';
import { DEMO_DATASOURCES, PRODUCTION_DATASOURCES } from '../constants';

type ClientDataSources = { [key: string]: ClientDataSource<any, any> | undefined };

export const allClientDataSources: ClientDataSources = {
  rest,
  function: functionSrc,
  postgres,
  googleSheets,
};

const clientDataSources = _.pick(allClientDataSources, [
  ...(config.isDemo ? DEMO_DATASOURCES : PRODUCTION_DATASOURCES),
]);

export default clientDataSources;
