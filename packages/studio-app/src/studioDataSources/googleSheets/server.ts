import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import {
  StudioApiResult,
  StudioDataSourceServer,
  ConnectionStatus,
  StudioConnection,
  ConnectionStage,
} from 'src/types';
import config from 'src/server/config';
import { asArray } from 'src/utils/collections';
import { GoogleSheetsConnectionParams, GoogleSheetsQuery } from './types';
import { updateConnection } from 'src/server/data';

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
  const client = createClient();
  if (connection.params) client.setCredentials(connection.params);
  const sheets = google.sheets({
    version: 'v4',
    auth: client,
  });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: query?.spreadsheetId,
      //TODO: Replace default range with user input
      range: 'A1:E10',
    });
    if (response.statusText === 'OK') {
      //TODO: Replace default sheet with user specified sheet
      let list = response.data.values;

      let fields = list?.[0]?.reduce((acc, currValue) => ({ ...acc, [currValue]: '' }), {});

      const data = list?.slice(1).map((row, index) => {
        let rowObject: any = { id: index };
        row.forEach((elem, index) => {
          rowObject[list?.[0]?.[index]] = elem;
        });
        return rowObject;
      });

      return { fields, data };
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to fetch spreadsheetId ${query?.spreadsheetId}`);
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

function createHandler(req: NextApiRequest, res: NextApiResponse): void {
  const client = createClient();
  let stage: ConnectionStage = 'CREATE';

  if (req.query.type[1]) {
    stage = req.query.type[1].toUpperCase() as ConnectionStage;
  }

  const [state] = asArray(req.query.state);

  if (stage === 'CREATE') {
    //TODO: Return 500 if config.googleSheets... is not defined
    //TODO: Redo with OIDC instead of OAuth2
    res.redirect(
      client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/spreadsheets'],
        state,
      }),
    );
  } else if (stage === 'REDIRECT') {
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
      res.redirect(`/_studio/editor/connections/${state}`);
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

const dataSource: StudioDataSourceServer<GoogleSheetsConnectionParams, any> = {
  test,
  exec,
  createHandler,
};

export default dataSource;
