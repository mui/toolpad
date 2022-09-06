# Function

<p class="description">
    Function datasource is an advanced way to make request from Toolpad app.
</p>

## Working with functions

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section you can either create a reusable `connection` or simply create a new `query` and put all connection details inline.

1. Choose `ADD QUERY` in the `Properties editor` on the right.

1. Select `Function` datasource and click `CREATE QUERY`:

   ![Function datasource](/static/toolpad/function-query-1.png)

1. We got all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition we are now presented with a `code editor` where we can write a custom code for data fetching:

   ![Function configuration](/static/toolpad/function-query-2.png)

   Supported features:

   - Subset of webplatform APIs:

     - fetch (Request, Response)
     - AbortController
     - console (.log, .debug, .info, .warn, .error)
     - setTimeout, clearTimeout
     - TextEncoder, TextDecoder
     - ReadableStream

   - Access outside variables by binding `Parameters` fields.
   - `Console` and `Network` tabs for an easier debugging.

   Current limitations:

   - We can not import modules.

1. Once finished with configuration click `SAVE` and click anywhere outside of the dialog to return to the editor.

## Use cases

While [function](/toolpad/connecting-to-datasources/function/) datasource can suffice for many different setups we found some advances use cases where limitations of `function` datasource starts surfacing and prevents us from building more complex data access `queries`.

1. **Fetching** data from **multiple data sources** and **combining** the result:

   ![Function combined result](/static/toolpad/function-query-3.png)

1. **Chaining** multiple request:

   In this example we want to fetch name of the top contributor of **mui/materual-ui** repository, in order to do that we first need to fetch a list of contributors for a given repo. Once we have a response and link to a top contributor we can do a follow up request to fetch details about specific user.

   ![Function chained](/static/toolpad/function-query-4.png)
