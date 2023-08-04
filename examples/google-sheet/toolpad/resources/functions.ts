const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

const googleAuth = new JWT({
  email: process.env.client_email,
  key: process.env.private_key,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

export async function fetchList() {
  const service = google.drive({ version: 'v3', auth: googleAuth });
  const sheets = await service.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });

  return sheets.data.files;
}

export async function fetchSheet(spreadsheetId: string, range: string) {
  const service2 = google.sheets({ version: 'v4', auth: googleAuth });

  const res = await service2.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const [header, ...rows] = res.data.values;
  return rows.map((row) => Object.fromEntries(header.map((key, i) => [key, row[i]])));
}
