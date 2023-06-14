import { ExecFetchResult } from '@mui/toolpad-core';
import { ServerDataSource } from '../../types';
import { LocalPrivateQuery, LocalQuery, LocalConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import { getProject } from '../../server/liveProject';

async function exec(
  connection: Maybe<LocalConnectionParams>,
  fetchQuery: LocalQuery,
  parameters: Record<string, string>,
): Promise<ExecFetchResult<any>> {
  const project = await getProject();
  if (!fetchQuery.function) {
    throw new Error('Missing function name');
  }
  const { data, error } = await project.functionsManager.exec(
    fetchQuery.file || 'functions.ts',
    fetchQuery.function,
    fetchQuery.spreadParameters
      ? fetchQuery.spreadParameters.map((name) => parameters[name])
      : [{ parameters }],
  );
  return { data, error };
}

async function execPrivate(connection: Maybe<LocalConnectionParams>, query: LocalPrivateQuery) {
  switch (query.kind) {
    case 'introspection': {
      const project = await getProject();
      return project.functionsManager.introspect();
    }
    case 'debugExec': {
      return exec(null, query.query, query.params);
    }
    case 'openEditor': {
      const project = await getProject();
      return project.functionsManager.openQueryEditor();
    }
    default:
      throw new Error(`Unknown private query "${(query as LocalPrivateQuery).kind}"`);
  }
}

const dataSource: ServerDataSource<{}, LocalQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
