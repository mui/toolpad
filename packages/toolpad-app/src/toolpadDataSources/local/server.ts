import { ExecFetchResult } from '@mui/toolpad-core';
import { ServerDataSource } from '../../types';
import { LocalPrivateQuery, LocalQuery, LocalConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import { getProject } from '../../server/liveProject';

async function execPrivate(connection: Maybe<LocalConnectionParams>, query: LocalPrivateQuery) {
  switch (query.kind) {
    case 'introspection': {
      const project = await getProject();
      return project.functionsManager.introspect();
    }
    case 'debugExec': {
      const project = await getProject();
      if (!query.query.function) {
        throw new Error('Missing function name');
      }
      return project.functionsManager.exec('functions.ts', query.query.function, query.params);
    }
    case 'openEditor': {
      const project = await getProject();
      return project.functionsManager.openQueryEditor();
    }
    default:
      throw new Error(`Unknown private query "${(query as LocalPrivateQuery).kind}"`);
  }
}

async function exec(
  connection: Maybe<LocalConnectionParams>,
  fetchQuery: LocalQuery,
  params: Record<string, string>,
): Promise<ExecFetchResult<any>> {
  const project = await getProject();
  if (!fetchQuery.function) {
    throw new Error('Missing function name');
  }
  const { data, error } = await project.functionsManager.exec(
    'functions.ts',
    fetchQuery.function,
    params,
  );
  return { data, error };
}

const dataSource: ServerDataSource<{}, LocalQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
