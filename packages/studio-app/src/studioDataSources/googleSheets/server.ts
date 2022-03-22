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
import { GoogleSheetsActionKind, GoogleSheetsConnectionParams, GoogleSheetsQuery } from './types';

async function test(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
): Promise<ConnectionStatus> {
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  return { timestamp: Date.now() };
}

/**
 * Create an OAuth2 client based on the configuration
 */

function createOAuthClient() {
  if (
    !config.googleSheetsClientId ||
    !config.googleSheetsClientSecret ||
    !config.googleSheetsRedirectUri
  ) {
    return undefined;
  }
  return new google.auth.OAuth2(
    config.googleSheetsClientId,
    config.googleSheetsClientSecret,
    config.googleSheetsRedirectUri,
  );
}

async function execPrivate(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
  query: GoogleSheetsQuery,
): Promise<any> {
  const client = createOAuthClient();
  if (client) {
    if (connection.params) {
      client.setCredentials(connection.params);
    }
    if (query.type === GoogleSheetsActionKind.FETCH_SHEET) {
      const sheetsClient = google.sheets({
        version: 'v4',
        auth: client,
      });
      const spreadsheetId = query.spreadsheet?.id;
      try {
        const response = await sheetsClient.spreadsheets.get({
          spreadsheetId,
          includeGridData: false,
        });
        if (response.statusText === 'OK') {
          const { sheets } = response.data;
          return { sheets: sheets?.map((sheet) => sheet.properties) };
        }
      } catch (error) {
        throw new Error(`Unable to fetch spreadsheetId ${query?.spreadsheet?.id}`);
      }
    } else if (query.type === GoogleSheetsActionKind.FETCH_SPREADSHEETS) {
      const driveClient = google.drive({
        version: 'v3',
        auth: client,
      });
      try {
        const response = await driveClient.files.list({
          q: "mimeType='application/vnd.google-apps.spreadsheet'",
        });
        return response.data;
      } catch (error) {
        throw new Error(`Unable to fetch spreadsheets`);
      }
    }
  }
  return {
    fields: {},
    data: [],
  };
}

async function exec(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
  query: GoogleSheetsQuery,
): Promise<StudioApiResult<any>> {
  const client = createOAuthClient();
  if (client) {
    if (connection.params) {
      client.setCredentials(connection.params);
    }
    const sheets = google.sheets({
      version: 'v4',
      auth: client,
    });
    try {
      if (query?.spreadsheet) {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: query.spreadsheet.id,
          range: query.ranges,
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
      }
    } catch (error) {
      throw new Error(`Unable to fetch spreadsheetId ${query?.spreadsheet?.id}`);
    }
  }
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

async function handler(
  api: CreateHandlerApi,
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<NextApiResponse | void> {
  const client = createOAuthClient();
  const pathname = `/${asArray(req.query.path).join('/')}`;

  const matchAuthLogin = match('/auth/login', { decode: decodeURIComponent });
  const matchAuthCallback = match('/auth/callback', { decode: decodeURIComponent });

  const [state] = asArray(req.query.state);
  const { connectionId, appId } = JSON.parse(decodeURIComponent(state));

  if (!client) {
    return res.status(500).json({ message: 'Missing credentials for establishing connection.' });
  }

  // Check if connection with connectionId exists, if so: merge
  try {
    const savedConnection = await api.getConnection(appId, connectionId);
    if (savedConnection?.params) {
      client.setCredentials(savedConnection.params as GoogleSheetsConnectionParams);
    }
  } catch (err) {
    console.error(err);
  }

  if (matchAuthLogin(pathname)) {
    return res.redirect(
      client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive',
        ],
        state,
      }),
    );
  }
  if (matchAuthCallback(pathname)) {
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
      return res.redirect(`/_studio/app/${appId}/editor/connections/${connectionId}`);
    });
  }

  return res.status(404).json({ message: 'No handler exists for the given route' });
}

const dataSource: StudioDataSourceServer<GoogleSheetsConnectionParams, any> = {
  test,
  exec,
  execPrivate,
  createHandler: () => handler,
};

export default dataSource;
