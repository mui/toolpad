import { ExecFetchResult } from '@mui/toolpad-core';
import { Maybe } from '@mui/toolpad-utils/types';
import { ServerDataSource } from '../../types';
import { LocalQuery, LocalConnectionParams, LocalPrivateApi } from './types';
import { parseLegacyFunctionId } from './shared';
import type { IToolpadProject } from '../server';

export default function createDatasource(
  project: IToolpadProject,
): ServerDataSource<{}, LocalQuery, any, LocalPrivateApi> {
  const exec = async (
    connection: Maybe<LocalConnectionParams>,
    fetchQuery: LocalQuery,
    parameters: Record<string, string>,
  ): Promise<ExecFetchResult<any>> => {
    if (!fetchQuery.function) {
      throw new Error('Missing function name');
    }
    const parsed = parseLegacyFunctionId(fetchQuery.function);
    if (!parsed.handler) {
      throw new Error('Missing function name');
    }
    const { data, error } = await project.functionsManager.exec(
      parsed.file,
      parsed.handler,
      parameters,
    );
    return { data, error };
  };

  return {
    exec,
    api: {
      async introspection() {
        return project.functionsManager.introspect();
      },
      async debugExec(query, params) {
        return exec(null, query, params);
      },
      async createNew(fileName) {
        return project.functionsManager.createFunctionFile(fileName);
      },
    },
  };
}
