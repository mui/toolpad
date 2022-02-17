import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {
  StudioApiResult,
  StudioDataSourceServer,
  ConnectionStatus,
  StudioConnection,
  ConnectionStage,
} from 'src/types';
import config from 'src/server/config';
import { addConnection } from 'src/server/data';
import { asArray } from 'src/utils/collections';
import { GoogleSheetsConnectionParams } from './types';

async function test(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
): Promise<ConnectionStatus> {
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function exec(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
): Promise<StudioApiResult<any>> {
  return {
    fields: {},
    data: [],
  };
}

/**
 * Handler for new OAuth2 connections
 * @param {NextApiRequest} req  The request object
 * @param {NextApiResponse} res The response object
 */

function createHandler(req: NextApiRequest, res: NextApiResponse): void {
  const client = createClient();
  let stage: ConnectionStage = 'CREATE';

  if (req.query.type[1]) {
    stage = req.query.type[1].toUpperCase() as ConnectionStage;
  }

  if (stage === 'CREATE') {
    const { id, name } = req.query;
    res.redirect(
      client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets',
        ],
        state: `${id}-${name}`,
      }),
    );
  } else if (stage === 'REDIRECT') {
    const [code] = asArray(req.query.code);
    const [state] = asArray(req.query.state);

    client.getToken(code, async (error, token) => {
      if (error) throw new Error(error.message);
      if (token) {
        client.setCredentials(token);
        const connection = createConnection(state, client);
        await addConnection(connection);
      }
      res.redirect('/_studio/connections');
    });
  }
}

/**
 * Create an OAuth2 client based on the configuration
 */

function createClient() {
  return new google.auth.OAuth2(
    config.googleSheetsClientId,
    config.googleSheetsClientSecret,
    config.googleSheetsRedirectUri,
  );
}

/**
 * Create a StudioConnection based on the connection parameters
 * @param {StudioConnectionSummary} state Connection parameters in the form of `{id}-{name}`
 * @param {OAuth2Client} client Authenticated Google OAuth2 client object
 */

function createConnection(state: string, client: OAuth2Client): StudioConnection {
  const [id, name] = state.split('-');
  let connection: StudioConnection = {
    id: id,
    type: 'googleSheets',
    name: name,
    params: {},
    status: null,
  };
  if (client) {
    connection.params = client;
  }
  return connection;
}

const dataSource: StudioDataSourceServer<GoogleSheetsConnectionParams, any> = {
  test,
  exec,
  createHandler,
};

export default dataSource;
