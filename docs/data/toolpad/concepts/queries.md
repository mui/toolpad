# Queries

<p class="description">Be it a database table or an external API, Toolpad offers mechanisms to bring server-side data to the page.</p>

You can create two kinds of **queries** in Toolpad to bring data to your page.

1. HTTP request
2. Custom functions

:::info
Toolpad uses `react-query` internally to run queries. Look into [its documentation](https://tanstack.com/query/latest/docs/react/guides/queries) for more details on query objects.
:::

## Mode

You can set the **mode** of the query to either be automatically refetched on page load, or only be called on manual action.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/mode-query.gif", "alt": "Query mode", "caption": "Setting the query mode", "indent": 1, "aspectRatio": 6}}

- ### Automatic

  You can configure the following settings in this mode:

  - **Enabled**

    You can use this option to enable or disable the query from running

  - **Refetch interval**

    You can configure the query to run on an interval, for example every 30s.
    To disable this option, keep the field empty.

  Queries set to the automatic mode may be re-fetched via the `refetch` function available on these query objects. For example, for a query named `getOrders`, we can add

  ```js
  getOrders.refetch();
  ```

  in the `onClick` binding of a Button component.

- ### Manual

  Queries set to this mode can be called via a JavaScript expression in a binding. For example, for a query named `createCustomer`, we can add

  ```js
  createCustomer.call();
  ```

  in the `onClick` binding of a Button component. This will trigger this query when the Button is clicked.

:::info
See the [event handling](/toolpad/concepts/managing-state/#event-handling) section for more details, and the [deleting data grid row](/toolpad/how-to-guides/delete-datagrid-row/) guide for a detailed usage example.
:::
