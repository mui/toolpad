# Connecting to Google sheets

<p class="description">Quickly fetch data from Google sheets to build a Toolpad app </p>

We can write a custom function to read or write data from a Google sheet. We'll use [google-auth-library](https://www.npmjs.com/package/google-auth-library) and [googleapis](https://www.npmjs.com/package/googleapis) packages for this.

There are many ways to authenticate Google APIs as mentioned in google-auth-library. We'll use JWT tokens as we are creating a server based application.

## Connecting to Google sheet

### Pre requisites

1. You are required to create a service account from Google dev console.
2. Download the keys file to your local. It is a JSON file that contains secrets and need to be handeled cautiously.
3. From the JSON file we'll use client_email and private_key to in .env file to setup authentcation.
4. Share the Google sheet you want to show with client_email account.

### Custom function

In our code editor, inside `/resources/functions.ts`, we'll create a function `fetchList` to fetch the list of files that this client_email service account is allowed to access:

```ts
export async function fetchList() {
  const service = google.drive({ version: 'v3', auth: googleAuth });
  const sheets = await service.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });

  return sheets.data.files;
}
```

Now in Toolpad editor, Click on `Add Query` and choose Custom function. You should be able to see the function `fetchList` that we created.
Then drag a Select component on the canvas and bind it with the above query to show the list of accessible files to the end user.

Now we'll create another function `fetchSheet` to show the details of a chosen sheet.

```ts
export async function fetchSheet(spreadsheetId: string, range: string) {
  const service2 = google.sheets({ version: 'v4', auth: googleAuth });

  const res = await service2.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const [header, ...rows] = res.data.values;
  return rows.map((row) =>
    Object.fromEntries(header.map((key, i) => [key, row[i]])),
  );
}
```

Create a corresponding `fetchList` query. When you'll run the above function, you should be able to see data in your Toolpad app. You can bind it to a datagrid in your application.

**Note**: The process remains same if you want to connect to any other Google service like Docs, Analytics, Youtube API etc.
