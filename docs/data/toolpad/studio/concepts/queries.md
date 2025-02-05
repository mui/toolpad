# Connecting to data

<p class="description">Be it a database table or an external API, Toolpad Studio offers mechanisms to read to – and write from – server-side data.</p>

:::info
Toolpad Studio uses `react-query` internally to run queries and actions. Look into [its documentation](https://tanstack.com/query/latest/docs/framework/react/guides/queries) for more details on query objects.
:::

## Queries

Queries allow you to bring backend data to your Toolpad Studio page. They are called automatically on page load, so that data is available as state on the page as soon as the user interacts with it. Toolpad Studio will cache and regularly refresh the data. This means that your backend function will be called more than once. Queries are not suitable for backend functions that modify data. You can modify the following settings for queries:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-settings.png", "alt": "Query settings", "caption": "Settings for queries", "indent": 1, "aspectRatio": 6}}

- **`Mode`**

  You can turn a query into an action through this setting.

- **`Refetch interval`**

  You can configure the query to run on an interval, for example every 30s.

- **`Enabled`**

  You can use this option to enable or disable the query from running

Queries may be programmatically re-fetched via the `refetch` function available on these query objects. For example, for a query named `getOrders`, you can add

```js
getOrders.refetch();
```

in the `onClick` binding of a Button component.

## Actions

Actions allow performing updates to remote data sources (edit, update, delete) on a user interaction. Actions are not automatically called, they must be programmatically called a JavaScript expression in a binding. For example, for a query named `createCustomer`, we can add

```js
createCustomer.call();
```

in the `onClick` binding of a Button component.

:::info
See the [event handling](/toolpad/studio/concepts/event-handling/) section for more details
:::
