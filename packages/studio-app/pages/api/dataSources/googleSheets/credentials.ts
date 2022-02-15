import { NextApiHandler } from 'next';
import config from 'src/server/config';
import { StudioConnection } from 'src/types';
import { GoogleSheetsConnectionParams } from 'src/studioDataSources/googleSheets/types';
import { addConnection } from 'src/server/data';

export default (async (req, res) => {
  if (req.method === 'GET') {
    // TODO: Return 500 if config.googleSheets... undefined
    const url = new URL('https://oauth2.googleapis.com/token');
    url.searchParams.set('code', req.query.code as string);
    url.searchParams.set('clientId', config.googleSheetsClientId as string);
    url.searchParams.set('clientSecret', config.googleSheetsClientSecret as string);
    url.searchParams.set('grant_type', 'authorization_code');
    url.searchParams.set(
      'redirect_uri',
      'http://localhost:3000/api/dataSources/googleSheets/credentials',
    );

    const response = await fetch(url.toString(), { method: 'POST' });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const body = await response.json();

    const params: GoogleSheetsConnectionParams = {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
    };

    const googleSheetsConnection: StudioConnection<GoogleSheetsConnectionParams> = {
      id: '',
      type: 'googleSheets',
      name: req.query.state as string,
      params,
      status: null,
    };

    await addConnection(googleSheetsConnection);
    res.redirect('/_studio/connections/');
  } else {
    // Handle any other HTTP method
  }
}) as NextApiHandler;
