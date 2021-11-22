import { NextApiHandler } from 'next';
import { ConnectionStatus, StudioConnection, StudioConnectionSummary } from '../../../lib/types';
import { addConnection, getConnections, getConnectionSummaries } from '../../../lib/data';
import dataSources from '../../../lib/studioDataSources/server';

async function testConnection<P = any>(
  type: string,
  connection: StudioConnection<P>,
): Promise<ConnectionStatus> {
  const dataSource = dataSources[type];
  if (!dataSource) {
    return { timestamp: Date.now(), error: `Unknown datasource "${type}"` };
  }
  return dataSource.test(connection);
}

export default (async (req, res) => {
  switch (req.method) {
    case 'GET':
      // TODO: secure this
      if (req.query.full) {
        return res.json(await getConnections());
      } 
        return res.json(await getConnectionSummaries());
      
    case 'POST': {
      if (req.body.test) {
        const status = await testConnection(req.body.type, req.body.params);
        return res.json({ ...req.body, status });
      } 
        return res.json(await addConnection(req.body));
      
    }
    default: {
      return res.status(404).end();
    }
  }
}) as NextApiHandler<StudioConnection[] | StudioConnection | StudioConnectionSummary[]>;
