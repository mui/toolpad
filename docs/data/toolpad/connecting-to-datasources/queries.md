# Queries

<p class="description">
    Toolpad allows us to easily connect to external data sources and render dynamic data. The easiest way to do so is to create a new <b>QUERY</b> which can be used to fetch data.
</p>

1. Locate **ADD QUERY** button in the **Inspector** on the right:

   ![Query](/static/toolpad/query-1.png)

2. There are currently **4 different datasources\*** that can be used to fetch data:

   ![Datasources](/static/toolpad/query-2.png)

   - [Function](/toolpad/connecting-to-datasources/function/) - advanced fetching methods which gives a lot of freedom by allowing to write custom fetching code.
   - [Fetch](/toolpad/connecting-to-datasources/fetch/) - basic, but very powerful. Just pass URL of an API endpoint and you are ready to query your data.
   - [Google Sheets](/toolpad/connecting-to-datasources/google-sheets/) - allows accessing data from your **Google sheet** document.
   - [PostgreSQL](/toolpad/connecting-to-datasources/postgreSQL/) - ability to hook directly into your own DB without the need to use API.

   \* - by default you will see only **Function** and **Fetch** datasources, for **Google Sheets** and **PostgreSQL** you will first need to create a [CONNECTION instance](/toolpad/connecting-to-datasources/connections/).

3. After choosing the **QUERY** datasource and clicking **CREATE QUERY** you will be presented with a query configuration dialog (configuration settings for each individual type are documented on their respective pages).

   There are a few configuration options that are applicable to every **QUERY** type:

   ![Query configuration](/static/toolpad/query-3.png)

   - **Refetch on window focus** - execute the query every time the window is focused to make sure you always have the latest data visible.
   - **Refetch on network reconnect** - execute the query every time the network status changes.
   - **Refetch interval** - you can configure the query to run on an interval, e.g. **every 30s**. To disable this option, keep the field empty.

## What's next?

Learn all about [CONNECTIONS](/toolpad/connecting-to-datasources/connections/) to find out how to use the other **QUERY** types.
