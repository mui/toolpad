# Queries

<p class="description">Toolpad allows you to bring remote data as state to the page and allows your UI to bind itself to this state.</p>

Be it a database table or an external API, most data we want to display ijn Toolpad pages originates serverside. Toolpad offers mechanisms to bring this serverside data to the page. The most common way are **queries**. To configure a query we need to follow these steps:

1. Click **Add query** button in the **Inspector** on the right:

   <img src="/static/toolpad/docs/queries/query-1.png" alt="Query" width="287px" />

1. At the moment there are two remote data sources we support:

   <img src="/static/toolpad/docs/queries/query-2.png" alt="Datasources" width="591px" />

   - [serverside javascript](/toolpad/connecting-to-datasources/function/) - Write serverside javascript functions and their result will be automatically made available on the page. These have full access to the Node.js environment they run under.
   - [serverside HTTP request](/toolpad/connecting-to-datasources/fetch/) - Basic, but very powerful. Just pass URL of an API endpoint and you are ready to query your data.

   CLick any of these to start configuration.

1. There are a few configuration options that are applicable to every query type:

   <img src="/static/toolpad/docs/queries/query-3.png" alt="Query configuration" width="855px" />

   - **mode**
     - **Fetch at any time to always be availabe on the page** - execute the query every time the window is focused to make sure you always have the latest data visible.
     - **Only fetch on manual action** - query has to be executed manually
   - **Enabled** - whether the fetch mode option should be enabled
   - **Refetch interval** - you can configure the query to run on an interval, e.g. **every 30s**. To disable this option, keep the field empty.
