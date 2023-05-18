# Function datasource

<p class="description">Function datasource is an advanced way to make request from Toolpad app.</p>

## Working with functions

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section you can either create a reusable connection or simply create a new query and put all connection details inline:

1. Choose **ADD QUERY** in the **Inspector** on the right.

1. Select function datasource and click **CREATE QUERY**:

   <img src="/static/toolpad/docs/function/function-1.png" alt="Function datasource" width="592" />

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition you are now presented with a **code editor** where you can write a custom code for data fetching:

   <img src="/static/toolpad/docs/function/function-2.png" alt="Function configuration" width="1441" />

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

   <!-- markdownlint-disable MD032 -->
   <!--
   export default async function ({ parameters }: ToolpadFunctionEvent) {
      const result = await fetch('https://example.com/api', {
         method: 'POST',
         body: parameters.input.toUpperCase()
      })

      return await result.json();
   }
    -->
    <!-- markdownlint-enable MD032 -->

   <img src="/static/toolpad/docs/function/function-3.png" alt="Function pre-processing" width="709px" style="margin-bottom: 16px;" />

1. **Fetching** data from **multiple data sources** and **combining** the result:

   <!-- markdownlint-disable MD032 -->
   <!--
   export default async function ({ parameters }: ToolpadFunctionEvent) {
      const URL_1 = 'https://dog.ceo/api/breed/hound/list';
      const URL_2 = 'https://dog.ceo/api/breed/hound/list';

      const response1 = await fetch(URL_1);
      const response2 = await fetch(URL_2);

      const finalResult = {
         hound: (await response1.json()).message,
         mastiff: (await response2.json()).message,
      }

      return finalResult;
   }
   -->
   <!-- markdownlint-enable MD032 -->

   <img src="/static/toolpad/docs/function/function-4.png" alt="Function combined result" width="1038" />

1. **Chaining** multiple request:

   In this example you might want to fetch name of the top contributor of **mui/materual-ui** repository, in order to do that you first need to fetch a list of contributors for a given repo. Once you have a response and link to a top contributor you can do a follow up request to fetch details about specific user:

   <!-- markdownlint-disable MD032 -->
   <!--
   export default async function ({ parameters }: ToolpadFunctionEvent) {
      const REPO_URL = 'https://api.github.com/repos/mui/material-ui/contributors';
      const contributors = await (await fetch(REPO_URL)).json()
      const topContributorURL = contributors[0].url;
      const topContributor = await (await fetch(topContributorURL)).json()

      return topContributor.name;
   }
   -->
   <!-- markdownlint-enable MD032 -->

   <img src="/static/toolpad/docs/function/function-5.png" alt="Function chained" width="875" />

1. **Custom error handling**:

   You can handle different error scenarios. I.e. if 404 error is returned you can still pass empty array so that UI does not break:

   <!-- markdownlint-disable MD032 -->
   <!--
   export default async function ({ parameters }: ToolpadFunctionEvent) {
      const result = await fetch('https://example.com/api')

      if (result.status === 404) {
         return []
      }

      return await result.json();
   }
   -->
   <!-- markdownlint-enable MD032 -->

   <img src="/static/toolpad/docs/function/function-6.png" alt="Function error handling" width="831" />
