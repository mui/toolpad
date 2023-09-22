# Data Providers

<p class="description">Bring tabular data to the frontend with server-side pagination and filtering.</p>

Toolpad functions are great to bring some backend state to the page, but they fall short when it comes to offering pagination and filtering capabilities from the server. Toolpad offers a special construct to enable this use case: Data providers. Data providers abstract server-side collections. They could be database tables, or REST APIs, or any data that represents a set of records that share a common interface. Data providers are defined as server-side objects and can be directly connected to a data grid to make it fully interactive.

You can create new data provider in two ways

- **Through the UI:**

- **In the file system:**

## pagination

The data provider supports two styles of pagination. Index based, and cursor based pagination.

### Index based

This is the strategy your data is paginated by when it returns data based on a page number and page size. The `getRecords` method will receive `page` and `pageSize` values in it `paginationModel` parameter and returns a set of records representing the page. Index based pagination is the default but you can explicitly enable this by setting `paginationMode` to `'index'`.

```tsx
export default createDataProvider({
  paginationMode: 'index',
  async getRecords({ paginationModel: { start = 0, pageSize } }) {
    const { page, totalCount } = await db.getRecords(start, pageSize);
    return {
      records: page,
      totalCount,
    };
  },
});
```

### Cursor based

This is the strategy your data is paginated by when it returns data based on a cursor and a page size. The `getRecords` method will receive `cursor` and `pageSize` values in it `paginationModel` parameter and returns a set of records representing the page. You indicate the cursor of the next page with a `cursor` property in the result. Pass `null` to signal the end of the collection. The You can enable Cursor based pagination by setting `paginationMode` to `'cursor'`.

```tsx
export default createDataProvider({
  paginationMode: 'cursor',
  async getRecords({ paginationModel: { cursor = null, pageSize } }) {
    const { page, nextPageCursor, totalCount } = await db.getRecords(
      cursor,
      pageSize,
    );
    return {
      records: page,
      cursor: nextPageCursor,
      totalCount,
    };
  },
});
```

## filtering 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## sorting 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## row editing 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## row creation 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## deleting rows 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::
