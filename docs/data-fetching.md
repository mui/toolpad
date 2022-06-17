# Data fetching

In order to be able to display external data, Toolpad needs to be able to connect to a datasource and execute queries against it. Toolpad allows you to connect to REST APIs and Google Sheets.

## data sources

A Toolpad app can connect to different data sources. To create this connection, click the "+" button next to "connections" in the left menu. A popup will open where you can pick the type of connection you want to make.

Choose a connection type and click "create". The connection editor will open where you can configure the necessary paramaters for this connection.

### Google sheets

<!-- TO DO (Bharat) -->

### REST API

Toolpad comes with a default REST API That you can use to make all purpose API calls. You can set up a connection to a REST API where you can configure a base URL, headers, authentication. In order to use API headers, one must define a base url.

- **No authentication**: The default
- **Basic authentication**: Allows you to set a username and a password which will eb automatically encoded for you in a `Authorization` header.
- **Bearer authentication**: Allows to configure a token that will be used in the `Authorization` header. e.g. to configure an access token for Oauth.

## queries

To make external data available on a page, you can define a query. To do so, deselect all elements in the page to make the page options visible. Click "Add query". A popoup opens that asks you to select one of the connections you have defined. After you click "create query" you'll be presented with a popup where you can set up the query that should run against the connection.

You'll also have access to a some options that influence the query behavior:

- **Refetch on window focus**: Rerun the query every time the window is focused to make sure you always have the latest data visible.
- **Refetch on network reconnect**: Rerun the query every time the network status changes.
- **Refetch interval**: You can configure the query to run on an interval, e.g. every 30s. To disable this option, just empty the field.
- **Transform response**: Use this to post process the data before it gets sent to the client. You'll have to define a function body that has parameter `data` which is the raw result as it comes from the data source. You're expected to return the transformed `data`
