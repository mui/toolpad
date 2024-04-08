# Google Sheets

<p class="description">Quickly fetch data from Google Sheets to build a Toolpad Studio app.</p>

You can write a custom function to read or write data from a Google sheet. We'll use [google-auth-library](https://www.npmjs.com/package/google-auth-library) and [googleapis](https://www.npmjs.com/package/googleapis) packages for this.

There are many ways to authenticate Google APIs, as mentioned in `google-auth-library`. This guide uses JWTs (JSON Web Tokens), which are appropriate for a server-based application.

<video controls width="100%" height="auto" style="contain" alt="google-sheet-app">
  <source src="/static/toolpad/docs/studio/examples/google-sheet.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Connecting to Google sheet

### Pre requisites

1. You are required to create a [service account](https://cloud.google.com/iam/docs/service-accounts-create) from Google dev console.
2. Download the keys file to your local environment. It is a JSON file that contains secrets that need to be handled cautiously.
3. Use `client_email` and `private_key` from the JSON file you downloaded in an `.env` file to set up authentication.
4. Share the Google sheet you want to show with the service account with the same `client_email`.

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

Now in Toolpad Studio editor, Click on `Add Query` and choose Custom function. You should be able to see the function `fetchList` that we created.
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

Create a corresponding `fetchList` query. When you'll run the above function, you should be able to see data in your Toolpad Studio app. You can bind it to a data grid in your application.

:::info
The process remains the same if you want to connect to any other Google service such as Docs, Analytics, Youtube API etc.
:::
