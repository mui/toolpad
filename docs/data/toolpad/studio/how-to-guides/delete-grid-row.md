# Delete a data grid row

<p class="description">You can add a delete functionality to the data grid in minutes.</p>

:::info
Toolpad Studio now supports [Data Providers](/toolpad/studio/concepts/data-providers/) as an improved way to manage CRUD operations in a data grids. With data providers you can set up [row deletion](/toolpad/studio/concepts/data-providers/#deleting-rows) just by supplying a backend function that performs the action.
:::

You can add a delete button to a data grid connected to any REST API, like so:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/delete-grid-row/delete-button.png", "alt": "Data grid with delete", "caption": "A data grid with a Delete button" }}

## Adding a delete query

1. First, we must add a query to delete a row. For this example, we're using an API which allows sending `DELETE` requests to `/customers/id`, so we can go ahead with creating an HTTP Request query.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/delete-grid-row/add-delete-query.png", "alt": "Adding an HTTP Request query", "caption": "Adding an HTTP Request query", "indent": 1 }}

2. Since this is a destructive action, it's important that you set the **mode** of this query to manual. Select **Only fetch on manual action** in the mode menu.

3. To add the `id` in the request URL, you can add an `id` parameter to the query and bind it to the following JavaScript expression:

   ```js
   dataGrid.selection?.['ID'];
   ```

   `dataGrid.selection` contains the selected row on runtime, and the 'ID' field contains the `id` needed to be passed in the endpoint

4. You can then bind the request URL to the following JavaScript expression:

   ```js
   `https://<API-BASE-URL>/customers/${parameters.id}`;
   ```

   where `<API-BASE-URL>` is the base path of our API.

5. That's it for configuring the delete query:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/delete-grid-row/delete-query.png", "alt": "Delete query", "caption": "The delete query", "indent": 1 }}

## Calling the delete query

1. Add a **Button**, label it as "Delete Order" and open the binding editor for its `onClick` event.

2. Call the delete query on this event using the following JavaScript expression action:
   ```js
   deleteOrder.call();
   ```

## Adding a refresh button

1. We want to be able to refresh our orders data once we've performed our delete operation.

2. Assuming that we have a `getOrders` query which fetches the orders, create another **Button** labeled "Refresh"

3. You can re-fetch queries set to **automatic** mode through a `refetch` function available on each query object set to the automatic mode.

4. Bind the `onClick` event of the Refresh button to the following JavaScript expression action:

   ```js
   getOrders.refetch();
   ```

## Configure loading states (Optional)

1. If we want to show some feedback to our users when a query is running, we can bind the `isLoading` and `isFetching` states of our queries to the `loading` props of our buttons. For example,

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/delete-grid-row/loading-button.png", "alt": "Delete button loading state binding", "caption": "Binding the loading prop of the delete button", "indent": 1 }}

2. This adds a loading state to the button whenever the query is running.

   :::info
   Head to the reference section for a detailed guide on the [Button component](/toolpad/studio/reference/components/button/) props exposed by Toolpad Studio
   :::

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/delete-grid-row/loading-button-running.png", "alt": "Delete button loading state", "caption": "The delete button in a loading state", "indent": 1 }}

## Wrapping up

If all went well, this is how our app should behave:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/delete-grid-row/delete-row.gif", "alt": "Delete row", "caption": "The delete row operation in effect", "aspectRatio": 3 }}
