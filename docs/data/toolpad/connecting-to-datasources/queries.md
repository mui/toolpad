# Queries

<p class="description">Toolpad allows you to bring remote data as state to the page and allows your UI to bind itself to this state.</p>

Be it a database table or an external API, most data we want to display in Toolpad pages originates serverside. Toolpad offers mechanisms to bring this serverside data to the page. The most common way is through **queries**. To configure a query we need to follow these steps:

1. Click **Add query** button in the **Inspector** on the right:

   <img src="/static/toolpad/docs/queries/query-1.png?v=0" alt="Query" width="284px" />

1. At the moment there are two remote data sources we support:

   <img src="/static/toolpad/docs/queries/query-2.png?v=0" alt="Select query type" width="464px" />

   - [serverside JavaScript](/toolpad/connecting-to-datasources/serverside-javascript/) - Write serverside JavaScript functions and their result will be automatically made available on the page. These have full access to the Node.js environment they run under.
   - [serverside HTTP request](/toolpad/connecting-to-datasources/serverside-http-request/) - Basic, but very powerful. Just pass URL of an API endpoint and you are ready to query your data.

   Click any of these to start configuration.

1. There are a few configuration options that are applicable to every query type:

   <img src="/static/toolpad/docs/queries/query-3.png?v=0" alt="Query configuration" width="855px" />

   - **mode**
     - **Fetch at any time to always be availabe on the page** - Execute the query automatically to make sure the latest data is always available on the page. Use this when you want to display remote data in the UI. The data must be idempotent, the query will be retried on error and executed on regular times to make sure the data on the page is up to date.
     - **Only fetch on manual action** - The query has to be executed manually.
   - **Enabled** - Whether the query should be active, you can use this to disable fetching until certain conditions are met. It may for instance be dependant on certain input.
   - **Refetch interval** - You can configure the query to run on an interval, e.g. **every 30s**. To disable this option, keep the field empty.

<div style="position: relative; padding-bottom: calc(82.1875% + 41px); height: 0;"><iframe src="https://demo.arcade.software/rsfo1Gfp0W2Py4Qcc0jk?embed" frameborder="0" loading="lazy" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;color-scheme: light;" title="Page 1 | Toolpad editor"></iframe></div>
