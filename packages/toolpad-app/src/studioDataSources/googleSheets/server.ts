import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { match } from 'path-to-regexp';
import {
  StudioApiResult,
  StudioDataSourceServer,
  ConnectionStatus,
  StudioConnection,
  CreateHandlerApi,
} from '../../types';
import config from '../../server/config';
import { asArray } from '../../utils/collections';
import {
  GoogleSheetsConnectionParams,
  GoogleSheetsPrivateQueryType,
  GoogleSheetsPrivateQuery,
  GoogleSheetsApiQuery,
} from './types';

/**
 * Create an OAuth2 client based on the configuration
 */

function createOAuthClient() {
  if (
    !config.googleSheetsClientId ||
    !config.googleSheetsClientSecret ||
    !config.studioExternalUrl
  ) {
    throw new Error('Missing googleSheets datasource client configuration');
  }
  return new google.auth.OAuth2(
    config.googleSheetsClientId,
    config.googleSheetsClientSecret,
    new URL('/api/dataSources/googleSheets/auth/callback', config.studioExternalUrl).href,
  );
}

/**
 * Test function for this connection
 * @param connection  The connection object
 * @returns The connection status
 */

async function test(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
): Promise<ConnectionStatus> {
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  return { timestamp: Date.now() };
}

/**
 * Private executor function for this connection
 * @param connection  The connection object
 * @param query  The query object
 * @returns The private api response
 */

async function execPrivate(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
  query: GoogleSheetsPrivateQuery,
): Promise<any> {
  const client = createOAuthClient();
  if (connection.params) {
    client.setCredentials(connection.params);
  }
  if (!query) {
    return {};
  }

  if (query.type === GoogleSheetsPrivateQueryType.FETCH_SPREADSHEETS) {
    const driveClient = google.drive({
      version: 'v3',
      auth: client,
    });

    const response = await driveClient.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
    });
    if (response.statusText === 'OK') {
      return response.data;
    }
    throw new Error(`Failed to fetch query: "${JSON.stringify(query)}"`);
  }
  if (query.type === GoogleSheetsPrivateQueryType.FETCH_SHEET) {
    const sheetsClient = google.sheets({
      version: 'v4',
      auth: client,
    });
    const { spreadsheetId } = query;
    const response = await sheetsClient.spreadsheets.get({
      spreadsheetId: spreadsheetId ?? undefined,
      includeGridData: false,
    });
    if (response.statusText === 'OK') {
      const { sheets } = response.data;
      return {
        sheets: sheets?.map((sheet) => sheet.properties),
      };
    }
    throw new Error(`Failed to fetch query: "${JSON.stringify(query)}"`);
  }
  throw new Error(`Invariant: Unrecognized private query: "${JSON.stringify(query)}"`);
}

/**
 * Executor function for this connection
 * @param connection  The connection object
 * @param query  The query object
 * @returns The api response
 */

async function exec(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
  query: GoogleSheetsApiQuery,
): Promise<StudioApiResult<any>> {
  const client = createOAuthClient();
  if (connection.params) {
    client.setCredentials(connection.params);
  }
  const sheets = google.sheets({
    version: 'v4',
    auth: client,
  });
  if (!query) {
    return { fields: {}, data: {} };
  }
  const { spreadsheetId, sheetName, ranges = 'A1:Z100' } = query;
  if (!spreadsheetId || !sheetName) {
    return { fields: {}, data: {} };
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${ranges}`,
  });
  if (response.statusText === 'OK') {
    const { values } = response.data;
    if (values && values.length > 0) {
      const headerRow = values.shift() ?? [];
      const fields = headerRow.reduce((acc, currValue) => ({ ...acc, [currValue]: '' }), {});
      const data = values.map((row, rowIndex) => {
        const rowObject: any = { id: rowIndex };
        row.forEach((elem, cellIndex) => {
          rowObject[headerRow[cellIndex]] = elem;
        });
        return rowObject;
      });
      return { fields, data };
    }
  }
  throw new Error(`Invariant: Unable to execute query: "${JSON.stringify(query)}"`);
}

/**
 * Handler for new connections
 * @param api  The api for the handler object
 * @param req  The request object
 * @param res The response object
 */

async function handler(
  api: CreateHandlerApi,
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<NextApiResponse | void> {
  const client = createOAuthClient();
  try {
    const pathname = `/${asArray(req.query.path)
      .map((segment) => encodeURIComponent(segment))
      .join('/')}`;
    const matchAuthLogin = match('/auth/login', { decode: decodeURIComponent });
    const matchAuthCallback = match('/auth/callback', { decode: decodeURIComponent });

    const [state] = asArray(req.query.state);
    const { connectionId, appId } = JSON.parse(decodeURIComponent(state));

    // Check if connection with connectionId exists, if so: merge
    const savedConnection = await api.getConnection(appId, connectionId);
    if (savedConnection.params) {
      client.setCredentials(savedConnection.params as GoogleSheetsConnectionParams);
    }
    if (matchAuthLogin(pathname)) {
      return res.redirect(
        client.generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
          ],
          state,
          include_granted_scopes: true,
        }),
      );
    }
    if (matchAuthCallback(pathname)) {
      const [oAuthError] = asArray(req.query.error);
      if (oAuthError) {
        throw new Error(oAuthError);
      }
      const [code] = asArray(req.query.code);
      return client.getToken(code, async (error, token) => {
        if (error) {
          throw new Error(error.message);
        }
        if (token) {
          client.setCredentials(token);
          await api.updateConnection(appId, {
            params: client.credentials,
            id: connectionId,
          });
        }
        return res.redirect(
          `/_studio/app/${encodeURIComponent(appId)}/editor/connections/${encodeURIComponent(
            connectionId,
          )}`,
        );
      });
    }
    return res.status(404).send('No handler exists for given path');
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return res.status(500).send(e.message);
    }
    return res.status(500).send(e);
  }
}

const dataSource: StudioDataSourceServer<GoogleSheetsConnectionParams, any> = {
  test,
  exec,
  execPrivate,
  createHandler: () => handler,
};

export default dataSource;
