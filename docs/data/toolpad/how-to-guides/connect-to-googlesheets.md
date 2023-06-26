# Connecting to Google sheets

<p class="description">Quickly fetch data from Google sheets to build a Toolpad app </p>

We can write a custom function to read or write data from a Google sheet. We'll use [google-auth-library](https://www.npmjs.com/package/google-auth-library) and [googleapis/sheets](https://www.npmjs.com/package/@googleapis/sheets) which is a sub module of [googleapis](https://www.npmjs.com/package/googleapis).

There are many ways to authenticate Google APIs as mentioned in google-auth-library. We'll use JWT tokens as we are creating a server based application.

## Connecting to Google sheet

### Pre requisites

1. You are required to create a service account from Google dev console.
2. Download the keys file to your local. It is a JSON file that contains secrets and need to be handeled cautiously.

### Custom function

In our code editor, inside `/resources/functions.ts`, we'll create a custom function using Toolpad's `createFunction` API:

```ts
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
```

This function will read the Google sheet that we have configured and will connect to it when triggered.
Now in Toolpad editor, Click on `Add Query` and choose Custom function. You should be able to see the function `fetchSheet` that we created.

You might get '_Error: the caller does not have permission_' error if you run it. That's because you haven't given the access to this sheet to this service account being used. Please share this sheet with the service account email ID.

Now, you should be able to see data in your Toolpad app. You can now transform it or bind to build your application.

**Note**: The process remains same if you want to connect to any other Google service like Docs, Analytics, Youtube API etc.
