# Data providers

<p class="description">Bring tabular data to the frontend with server-side pagination and filtering.</p>

Toolpad functions are great to bring some backend state to the page, but they fall short when it comes to offering pagination and filtering capabilities from the server. Toolpad offers a special construct to enable this use case: Data providers. Data providers abstract server-side collections. They could be database tables, REST APIs, or any data that represents a set of records that share a common interface. Data providers are defined as server-side objects and can be directly connected to a data grid to make it fully interactive.

Follow these steps to create a new data provider:

<video controls width="auto" height="100%" style="contain" alt="component-library">
  <source src="/static/toolpad/docs/concepts/data-providers/data-provider-1.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

A data provider that iterates over a static list could look as follows:

```tsx
import { createDataProvider } from '@mui/toolpad-core/server';
import DATA from './movies.json';

export default createDataProvider({
  async getRecords({ paginationModel: { start = 0, pageSize } }) {
    const records = DATA.slice(start, start + pageSize);
    return { records, totalCount: DATA.length };
  },
});
```

   <video controls width="auto" height="100%" style="contain" alt="component-library">
  <source src="/static/toolpad/docs/concepts/data-providers/data-provider-2.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Pagination

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

This is the strategy your data is paginated by when it returns data based on a cursor and a page size. The `getRecords` method will receive `cursor` and `pageSize` values in its `paginationModel` parameter and returns a set of records representing the page. You indicate the cursor of the next page with a `cursor` property in the result. Pass `null` to signal the end of the collection. You can enable Cursor based pagination by setting `paginationMode` to `'cursor'`.

The `cursor` property of the `paginationModel` is `null` when Toolpad fetches the initial page. Any result set returned from the `getRecords` function must be accompanied with a `cursor` property, a string which contains a reference to the next page. This value will be passed as the `cursor` parameter in the `paginationModel` when fetching the subsequent page. Return `null` for this value to indicate the end of the sequence.

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

## Filtering 🚧

:::warning
This feature isn't implemented yet.

👍 Upvote [issue #2886](https://github.com/mui/mui-toolpad/issues/2886) if you want to see it land faster.
:::

## Sorting 🚧

:::warning
This feature isn't implemented yet.

👍 Upvote [issue #2539](https://github.com/mui/mui-toolpad/issues/2539) if you want to see it land faster.
:::

## Row editing 🚧

:::warning
This feature isn't implemented yet.

👍 Upvote [issue #2887](https://github.com/mui/mui-toolpad/issues/2887) if you want to see it land faster.
:::

## Row creation 🚧

:::warning
This feature isn't implemented yet.
👍 Upvote [issue #2888](https://github.com/mui/mui-toolpad/issues/2888) if you want to see it land faster.
:::

## Deleting rows 🚧

:::warning
This feature isn't implemented yet.

👍 Upvote [issue #2889](https://github.com/mui/mui-toolpad/issues/2889) if you want to see it land faster.
:::

## API

See the documentation below for a complete reference to all of the functions and interfaces mentioned in this page.

- [`createDataProvider`](/toolpad/reference/api/create-data-provider/)
