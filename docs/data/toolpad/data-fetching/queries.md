# Queries

<p class="description">Query data inside a Toolpad app.</p>

To make external data available on a page, you can define a query.
To do so, deselect all elements in the page to make the page options visible. Click "Add query".
A popup opens that asks you to select one of the connections you have defined.
After you click "create query" you'll be presented with a popup where you can set up the query that should run against the connection.

You'll also have access to a some options that influence the query behavior:

- **Refetch on window focus**: Rerun the query every time the window is focused to make sure you always have the latest data visible.
- **Refetch on network reconnect**: Rerun the query every time the network status changes.
- **Refetch interval**: You can configure the query to run on an interval, e.g. every 30s. To disable this option, just empty the field.
- **Transform response**: Use this to post process the data before it gets sent to the client. You'll have to define a function body that has parameter `data` which is the raw result as it comes from the data source. You're expected to return the transformed `data`.
