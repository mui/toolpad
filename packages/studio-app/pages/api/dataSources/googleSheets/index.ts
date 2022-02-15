import { NextApiHandler } from 'next';
import config from '../../../../src/server/config';

export default (async (req, res) => {
  if (req.method === 'GET') {
    //TODO: Rewrite this with Node.js Google Sheets client
    const connectionName = req.query['name'];
    const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/spreadsheets&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=http%3A//localhost:3000/api/dataSources/googleSheets/credentials&client_id=${config.googleSheetsClientId}&state=${connectionName}`;
    res.redirect(url);
  } else {
    // Handle any other HTTP method
  }
}) as NextApiHandler;
