import { createFunction } from '@mui/toolpad/server';
const { sheets } = require('@googleapis/sheets');
const { JWT } = require('google-auth-library');
const keys = require('../../jwt.keys.json');

export const fetchSheet = createFunction(async function fetchSheet({ parameters }) {
  const googleAuth = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  console.log(googleAuth);

  const service = sheets({ version: 'v4', auth: googleAuth });
  const spreadsheetId = '1dHNfR8dDqJbYWqFkgCa4sffcIgSFaGL-BnHoCm39LGc';

  const res = await service.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A2:T14',
  });

  const rows = res.data.values;
  return rows;
});
