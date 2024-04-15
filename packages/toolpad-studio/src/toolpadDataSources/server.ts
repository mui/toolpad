import type { ServerDataSource, RuntimeConfig } from '../types';
import postgres from './postgres/server';
import mysql from './mysql/server';
import rest from './rest/server';
import googleSheets from './googleSheets/server';
import local from './local/server';
import type FunctionsManager from '../server/FunctionsManager';
import type EnvManager from '../server/EnvManager';

export interface IToolpadProject {
  functionsManager: FunctionsManager;
  envManager: EnvManager;
  getRuntimeConfig: () => Promise<RuntimeConfig>;
}

type ServerDataSources = {
  [key: string]:
    | ServerDataSource<any, any, any>
    | ((project: IToolpadProject) => ServerDataSource<any, any, any>)
    | undefined;
};

const dataSources: ServerDataSources = {
  rest,
  postgres,
  googleSheets,
  mysql,
  local,
};

export default dataSources;
