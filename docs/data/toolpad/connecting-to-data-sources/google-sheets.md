# Google Sheets

<p class="description">Google Sheets data source.</p>

## Setup Google Cloud

Google Cloud Platform allows us to authorize third-party applications to access files (docs, sheets, photos, etc.) in our Google Drive.
Below are the steps to create a Toolpad application that can be given permission to access your Google Drive folder using OAuth.

You need to enable Google Login to connect Google Sheets. If you're an existing user, you can sign in to [Google Console](https://cloud.google.com/) or create a new account.

1. The first step would be to [create a new Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project).

2. You need valid Google Oauth 2.0 credentials, specifically a Client ID and a Client Secret, to set
   this datasource up. Follow the instructions [here](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred) to generate these credentials.

3. You will need the following environment variables to setup the datasource:

   ```sh
   TOOLPAD_EXTERNAL_URL=<YOUR_APP_URL>
   TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_ID=
   TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_SECRET=
   ```

   where YOUR_APP_URL is the URL Toolpad is hosted on

4. Now add the following URIs under Authorized Redirect URIs:
   ```sh
   https://<YOUR_APP_URL>/api/dataSources/googleSheets/auth/callback</YOUR_APP_URL>
   ```
5. Lastly, you'll have to enable the Google Sheets and Google Drive APIs for the project using the instructions [here](https://developers.google.com/identity/protocols/oauth2/web-server#enable-apis).

## Adding Google Sheets as a datasource in Toolpad

From the App page;

1. Click on Connections "+" → From the type dropdown choose Google Sheets as the data source → Click on "Create"
2. Click on "Sign In To Google" → Authorize the application to fetch data from your Google Account
3. Click on APIs "+" → Choose the connection you have recently made → Click on "Create"
4. In the query editor, the spreadsheet input will show you the list of all available Google Sgitheets (your and the ones shared with you).
5. Choose the sheet, cell range → Click on "Update" to save the API

You should now be able to use this API in any App page.
