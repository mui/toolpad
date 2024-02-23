import rest from './rest/client';
import { ClientDataSource } from '../types';
import local from './local/client';

type ClientDataSources = { [key: string]: ClientDataSource<any, any> | undefined };

const dataSources: ClientDataSources = {
  rest,
  local,
};

export default dataSources;
