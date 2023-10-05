# Data Providers

<p class="description">Bring tabular data to the frontend with server-side pagination and filtering.</p>

Toolpad functions are great to bring some backend state to the page, but they fall short when it comes to offering pagination and filtering capabilities from the server. Toolpad offers a special construct to enable this use case: Data providers. Data providers abstract server-side collections. They could be database tables, REST APIs, or any data that represents a set of records that share a common interface. Data providers are defined as server-side objects and can be directly connected to a data grid to make it fully interactive.

Follow these steps to create a new data provider:

1. Drag a data grid into the canvas

2. Under its **Row Source** property, select the option **Data Provider**.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/data-providers/rows-source.png", "alt": "Select data provider row source", "caption": "Select data provider row source", "zoom": false, "width": 297}}

3. Click the data provider selector and choose **Create new data provider**.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/data-providers/create-data-provider.png", "alt": "Create data provider", "caption": "Create data provider", "zoom": false, "width": 294}}

4. Name the new data provider and click **Create**

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/data-providers/create-data-provider-dialog.png", "alt": "Create data provider dialog", "caption": "Create data provider dialog", "zoom": false, "width": 490}}

5. Use the code button to open your code editor with the data provider backend.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/data-providers/open-editor.png", "alt": "Open data provider editor", "caption": "Open data provider editor", "zoom": false, "width": 272}}

6. A data provider that iterates over a static list could look as follows:

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

This is the strategy your data is paginated by when it returns data based on a cursor and a page size. The `getRecords` method will receive `cursor` and `pageSize` values in its `paginationModel` parameter and returns a set of records representing the page. You indicate the cursor of the next page with a `cursor` property in the result. Pass `null` to signal the end of the collection. The You can enable Cursor based pagination by setting `paginationMode` to `'cursor'`.

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
This feature isn't implemented yet. It's coming.
:::

## Sorting 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## Row editing 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## Row creation 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## Deleting rows 🚧

:::warning
This feature isn't implemented yet. It's coming.
:::

## API

See the documentation below for a complete reference to all of the functions and interfaces mentioned in this page.

- [`createDataProvider`](/toolpad/reference/api/create-data-provider/)
