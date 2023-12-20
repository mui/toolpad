# Connecting to data

<p class="description">Be it a database table or an external API, Toolpad offers mechanisms to bring server-side data to the page as well as make mutations to external data sources. </p>

:::info
Toolpad uses `react-query` internally to run queries and actions. Look into [its documentation](https://tanstack.com/query/latest/docs/react/guides/queries) for more details on query objects.
:::

## Queries

Queries allow you to bring backend data to your Toolpad page. They are called automatically on page load, so that data is available as state on the page as soon as the user interacts with it. You can modify the following settings for queries:

- **`Enabled`**

  You can use this option to enable or disable the query from running

- **`Refetch interval`**

  You can configure the query to run on an interval, for example every 30s.

Queries may be programatically re-fetched via the `refetch` function available on these query objects. For example, for a query named `getOrders`, we can add

```js
getOrders.refetch();
```

in the `onClick` binding of a Button component.

## Actions

Actions allow performing updates to remote data sources (edit, update, delete) on a user interaction. Actions are not automatically called, they must be programtically called a JavaScript expression in a binding. For example, for a query named `createCustomer`, we can add

```js
createCustomer.call();
```

in the `onClick` binding of a Button component.
:::info
See the [event handling](/toolpad/concepts/event-handling/) section for more details
:::
