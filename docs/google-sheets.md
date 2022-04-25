# Google Sheets

## Setup Google Cloud

Google Cloud Platform allows us to authorise third-party applications to access files (docs, sheets, photos, etc.) in our Google Drive. Below are the steps to create a Toolpad application that can be given permission to access your Google Drive folder using OAuth.

You'll need to enable Google Login to connect Google Sheets. If you're an existing user, you can sign in to [Google Console](https://cloud.google.com/) or create a new account.

1. After signing in to Google Console, create a New Project from the top bar.
2. Now, you'll have to generate OAuth 2.0 Client IDs; you can do this by navigating to the APIs and Services - Credentials section.
3. Next, create a new app under the OAuth 2.0 Client ID section.
4. You'll now find two keys, Client ID and Client Secret; you'll need these to authorize Toolpad to access your Google Drive.
5. You will need the following environment variables to setup the datasource:

   ```
   TOOLPAD_EXTERNAL_URL=<YOUR_APP_URL>
   TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_ID=
   TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_SECRET=
   ```

   where YOUR_APP_URL is the URL Toolpad is hosted on

6. Now add the following URIs under Authorised Redirect URIs:
   ```bash
   https://<YOUR_APP_URL>/api/dataSources/googleSheets/auth/callback
   ```
7. Lastly, you'll have to enable APIs to communicate with different services. You'll have to search for Google Sheets and Google Drive APIs using the top search bar and enable them.

Reference from Google: [https://developers.google.com/identity/sign-in/web/sign-in](https://developers.google.com/identity/sign-in/web/sign-in)

## Adding Google Sheets as a datasource in Toolpad

From the App page;

1. Click on Connections "+" → From the type dropdown choose Google Sheets as the data source → Click on "Create"
2. Click on "Sign In To Google" → Authorise the application to fetch data from your Google Account
3. Click on APIs "+" → Choose the connection you have recently made → Click on "Create"
4. In the query editor, the spreadsheet input will show you the list of all available Google Sgitheets (your and the ones shared with you).
5. Choose the sheet, cell range → Click on “Update” to save the API

You should now be able to use this API in any App page.

Refer to the [Getting started](https://github.com/mui/mui-toolpad/blob/docs/sheets/docs/getting-started.md) section to learn more about building an application on Toolpad.
