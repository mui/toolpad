# Connections

<p class="description">A connection instance lets you reuse certain configuration details to create queries faster.</p>

To create a new connection instance, press the **+** button in the Explorer menu on the left side of the interface:

<img src="/static/toolpad/docs/connection.png" alt="Add connection" width="196px" />

## Connection types

There are 2 kinds of data sources that do not require a connection instance:

### Function

<img src="/static/toolpad/docs/connection-function-1.png" alt="Connection function" width="730px" />

You can define secrets (key/value) that can later be accessed in the function datasource query:

<img src="/static/toolpad/docs/connection-function-2.png" alt="Connection function" width="748px" />

### Fetch

<img src="/static/toolpad/docs/connection-fetch-1.png" alt="Connection fetch" width="723px" />

You can configure:

- **base url** - url that can be shared between different queries.
- **Headers** - pass custom headers with each request.
- **Authentication** type - if your API is protected choose authentication method that fits your needs:
  - **Basic** - adds authorization header and generates base64 encoded value for a given user credentials.
  - **Bearer token** - adds authorization header generates value for provided token.
  - **API key** - adds key/value header.

There are 2 datasources that require connection instance:

### Google Sheets

**Obtain credentials**

Before you create a Google sheets connection you must first configure Toolpad app by providing Google sheets **client id** and **secret**:

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

1. Once you create Google Sheets type connection click **CONNECT** button:

<img src="/static/toolpad/docs/connection-sheets-1.png" alt="Connection Google Sheets" width="724px" />

1. Choose google account that you want to authorize.

1. Grant access to your Google Drive files by clicking **Allow**.

1. Once you successfully connect your account you should see a button stating the acount that was connected.

<img src="/static/toolpad/docs/connection-sheets-2.png" alt="Google Sheets connected" width="721px" />

### PostgreSQL

To query data from a PostgreSQL database, you must configure the connection:

<img src="/static/toolpad/docs/connection-postgres-1.png" alt="Connection postgres" width="726px" />

Provide the database credentials and click **TEST CONNECTION** to verify that you're able to connect.

If everything is correct, click **SAVE** to complete the connection.

Learn more in the [PostgreSQL documentation](/toolpad/connecting-to-datasources/postgre-sql/).
