# Queries

<p class="description">Toolpad allows you to bring remote data as state to the page and allows your UI to bind itself to this state.</p>

Be it a database table or an external API, most data we want to display ijn Toolpad pages originates serverside. Toolpad offers mechanisms to bring this serverside data to the page. The most common way are **queries**. To configure a query we need to follow these steps:

1. Click **Add query** button in the **Inspector** on the right:

   <img src="/static/toolpad/docs/queries/query-1.png?v=0" alt="Query" width="284px" />

1. At the moment there are two remote data sources we support:

   <img src="/static/toolpad/docs/queries/query-2.png?v=0" alt="Datasources" width="464px" />

   - [serverside javascript](/toolpad/connecting-to-datasources/function/) - Write serverside javascript functions and their result will be automatically made available on the page. These have full access to the Node.js environment they run under.
   - [serverside HTTP request](/toolpad/connecting-to-datasources/fetch/) - Basic, but very powerful. Just pass URL of an API endpoint and you are ready to query your data.

   CLick any of these to start configuration.

1. There are a few configuration options that are applicable to every query type:

   <img src="/static/toolpad/docs/queries/query-3.png?v=0" alt="Query configuration" width="855px" />

   - **mode**
     - **Fetch at any time to always be availabe on the page** - Execute the query automatically to make sure the latest data is always available on the page. Use this when you want to display remote data in the UI. The data must be idempotent, the query will be retried on error and executed on regular times to make sure the data on the page is up to date.
     - **Only fetch on manual action** - The query has to be executed manually.
   - **Enabled** - Whether the query should be active, you can use this to disable fetching until certain conditions are met. It may for instance be dependant on certain input
   - **Refetch interval** - you can configure the query to run on an interval, e.g. **every 30s**. To disable this option, keep the field empty.
