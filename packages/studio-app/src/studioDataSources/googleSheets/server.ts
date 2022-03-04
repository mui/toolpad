import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { match, MatchResult } from 'path-to-regexp';
import {
  StudioApiResult,
  StudioDataSourceServer,
  ConnectionStatus,
  StudioConnection,
} from '../../../src/types';
import config from '../../../src/server/config';
import { asArray } from '../../../src/utils/collections';
import { getConnection, updateConnection } from '../../../src/server/data';
import {
  GoogleSpreadsheet,
  GoogleSheetsConnectionParams,
  GoogleSheetsQuery,
  GoogleSheet,
} from './types';

async function test(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
): Promise<ConnectionStatus> {
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  return { timestamp: Date.now() };
}

async function exec(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
  query: GoogleSheetsQuery,
  params: any,
): Promise<StudioApiResult<any>> {
  const client = createOAuthClient();
  if (client) {
    if (connection.params) client.setCredentials(connection.params);
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
            let headerRow = values.shift() ?? [];
            let fields = headerRow.reduce((acc, currValue) => ({ ...acc, [currValue]: '' }), {});

            const data = values.map((row, index) => {
              let rowObject: any = { id: index };
              row.forEach((elem, index) => {
                rowObject[headerRow[index]] = elem;
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

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<NextApiResponse | void> {
  const client = createOAuthClient();
  const pathname = `/${asArray(req.query.path).join('/')}`;

  const matchAuthLogin = match('/auth/login', { decode: decodeURIComponent });
  const matchAuthCallback = match('/auth/callback', { decode: decodeURIComponent });
  const matchDataSpreadsheet = match<GoogleSpreadsheet>('/data/spreadsheet/:id', {
    decode: decodeURIComponent,
  });

  const [state] = asArray(req.query.state);

  if (!client)
    return res.status(500).json({ message: 'Missing credentials for establishing connection.' });

  // Check if connection with connectionId exists, if so: merge
  const savedConnection = await getConnection(state);
  if (savedConnection?.params)
    client.setCredentials(savedConnection.params as GoogleSheetsConnectionParams);

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
  } else if (matchAuthCallback(pathname)) {
    const [code] = asArray(req.query.code);
    client.getToken(code, async (error, token) => {
      if (error) throw new Error(error.message);
      if (token) {
        client.setCredentials(token);
        await updateConnection({
          params: client.credentials,
          id: state,
        });
      }
      return res.redirect(`/_studio/editor/connections/${state}`);
    });
  } else if (matchDataSpreadsheet(pathname)) {
    const spreadsheetId = (matchDataSpreadsheet(pathname) as MatchResult<GoogleSpreadsheet>).params
      .id;
    if (spreadsheetId) {
      const sheets = google.sheets({
        version: 'v4',
        auth: client,
      });
      try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId: spreadsheetId,
          includeGridData: false,
        });
        if (response.statusText === 'OK') {
          const { sheets } = response.data;
          return res.status(200).json({ sheets: sheets?.map((sheet) => sheet.properties) });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json(error);
      }
    }
  } else {
    const drive = google.drive({
      version: 'v3',
      auth: client,
    });
    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
      });
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

/**
 * Create an OAuth2 client based on the configuration
 */

function createOAuthClient() {
  if (
    !config.googleSheetsClientId ||
    !config.googleSheetsClientSecret ||
    !config.googleSheetsRedirectUri
  )
    return undefined;
  return new google.auth.OAuth2(
    config.googleSheetsClientId,
    config.googleSheetsClientSecret,
    config.googleSheetsRedirectUri,
  );
}

const dataSource: StudioDataSourceServer<GoogleSheetsConnectionParams, any> = {
  test,
  exec,
  createHandler: () => handler,
};

export default dataSource;
