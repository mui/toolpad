# Function

<p class="description">
    Function datasource is an advanced way to make request from Toolpad app.
</p>

## Working with functions

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section you can either create a reusable connection or simply create a new query and put all connection details inline:

1. Choose **ADD QUERY** in the **Inspector** on the right.

1. Select function datasource and click **CREATE QUERY**:

   <img src="/static/toolpad/function-query-1.png" alt="Function datasource" width="400px" />

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition you are now presented with a **code editor** where you can write a custom code for data fetching:

   <img src="/static/toolpad/function-query-2.png" alt="Function configuration" width="600px" />

   Supported features:

   - Subset of webplatform APIs:

     - fetch (Request, Response)
     - AbortController
     - console (.log, .debug, .info, .warn, .error)
     - setTimeout, clearTimeout
     - TextEncoder, TextDecoder
     - ReadableStream

   - Access outside variables by binding parameters fields.
   - Console and Network tabs for an easier debugging.

   Current limitations:

   - You can not import modules.

1. Once finished with configuration click **SAVE** to commit your changes and return to the canvas.

## Use cases

While [function](/toolpad/connecting-to-datasources/function/) datasource can suffice for many different setups we found some advances use cases where limitations of function datasource starts surfacing and prevents us from building more complex data access queries.

1. **Pre-processing** request:

   You can execute extra steps before doing an actual request in case you need to do some pre-processing. I.e. sending parameters as a BASE64 encoded data:

   <img src="/static/toolpad/function-query-3.png" alt="Function pre-processing" width="550px" />
   <br />
   <br />

1. **Fetching** data from **multiple data sources** and **combining** the result:

   <img src="/static/toolpad/function-query-4.png" alt="Function combined result" width="570px" />

1. **Chaining** multiple request:

   In this example you might want to fetch name of the top contributor of **mui/materual-ui** repository, in order to do that you first need to fetch a list of contributors for a given repo. Once you have a response and link to a top contributor you can do a follow up request to fetch details about specific user:

   <img src="/static/toolpad/function-query-5.png" alt="Function chained" width="600px" />

1. **Custom error handling**:

   You can handle different error scenarios. I.e. if 404 error is returned you can still pass empty array so that UI does not break:

   <img src="/static/toolpad/function-query-6.png" alt="Function error handling" width="500px" />
