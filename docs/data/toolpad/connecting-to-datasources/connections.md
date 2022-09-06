# Connections

<p class="description">
    <b>CONNECTION</b> instance allows us to reuse certain configuration details to create <b>queries</b> faster.
</p>

In order to create a new `CONNECTION` instance press `+` button in the `Instance editor` on the left:

![Add Connection](/static/toolpad/connection.png)

## Connection types

There are 2 datasources that **do not require** `CONNECTION` instance:

1. [Function](/toolpad/connecting-to-datasources/function/) datasource:

   ![Connection function](/static/toolpad/connection-function-1.png)

   We can define `Secrets` (key/value) that we can later access in the `Function` datasource `query`:

   ![Connection function](/static/toolpad/connection-function-2.png)

1. [Fetch](/toolpad/connecting-to-datasources/fetch/) datasource:

   ![Connection fetch](/static/toolpad/connection-fetch-1.png)

   We can configure:

   - `base url` - url that can be shared between different queries.
   - `Headers` - pass custom headers with each request.
   - `Authentication` type - if your API is protected choose authentication method that fits your needs:
     - `Basic` - adds `Authorization` header and generates **base64** encoded value for a given user credentials.
     - `Bearer token` - adds `Authorization` header generates value for provided token.
     - `API key` - adds key/value header.

There are 2 datasources that **require** `CONNECTION` instance:

1. [Google Sheets](/toolpad/connecting-to-datasources/google-sheets/) datasource:

   **Obtain credentials**

   Before we create a `Google sheets` connection we must first configure Toolpad app by providing Google sheets `client id` and `secret`:

   1. Create a new Google Cloud project - [instructions](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project).

   2. Generate Oauth 2.0 credentials - [instructions](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred).

   3. Start Toolpad with following environment variables:

      ```sh
      TOOLPAD_EXTERNAL_URL=<YOUR_APP_URL>
      TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_ID=
      TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_SECRET=
      ```

      where YOUR_APP_URL is the URL Toolpad is hosted on.

   4. Add the following URIs under Authorized Redirect URIs:
      ```sh
      https://<YOUR_APP_URL>/api/dataSources/googleSheets/auth/callback</YOUR_APP_URL>
      ```
   5. Enable the Google Sheets and Google Drive APIs for the project - [instructions](https://developers.google.com/identity/protocols/oauth2/web-server#enable-apis).

   **Connect your google account**

   1. Once you create `Google Sheets` type connection click `CONNECT` button:

   ![Connection Google Sheets](/static/toolpad/connection-sheets-1.png)

   1. Choose google account that you want to authorize.

   1. Grant access to your Google Drive files by clicking `Allow`.

   1. Once you successfully connect your account you should see a button stating the acount that was connected.

   ![Google sheets connected](/static/toolpad/connection-sheets-2.png)

2. [PostgreSQL](/toolpad/connecting-to-datasources/postgreSQL/) datasource:

   In order `query` data from `postgres` database we **must** configure connection:

   ![Connection postgres](/static/toolpad/connection-postgres-1.png)

   Provide database credentials and `TEST CONNECTION` to verify that we are able to connect.

   If everything is correct `SAVE` and you will be able to use [PostgreSQL](/toolpad/connecting-to-datasources/postgreSQL/) queries.
