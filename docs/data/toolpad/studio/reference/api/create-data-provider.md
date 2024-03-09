# createDataProvider API

<p class="description">Define a backend to load server-side collections.</p>

## Import

```jsx
import { createDataProvider } from '@toolpad/studio/server';
```

## Description

```jsx
import { createDataProvider } from '@toolpad/studio-runtime/server';
import DATA from './movies.json';

export default createDataProvider({
  async getRecords({ paginationModel: { start = 0, pageSize } }) {
    const records = DATA.slice(start, start + pageSize);
    return { records, totalCount: DATA.length };
  },
});
```

Data providers expose collections to the Toolpad Studio frontend. They are server-side data structures that abstract the loading and manipulation of a backend collection of records of similar shape. They can be directly connected to data grids to display the underlying data.

## Parameters

- `config`: [`DataProviderConfig`](#dataproviderconfig) An object describing the data provider capabilities

## Returns

An object that is recognized by Toolpad Studio as a data provider and which is made available to the front-end.

## Types

### DataProviderConfig

Describes the capabilities of the data provider.

**Properties**

| Name              | Type                                                   | Description                                             |
| :---------------- | :----------------------------------------------------- | :------------------------------------------------------ |
| `paginationMode?` | `'index' \| 'cursor'`                                  | Declares the pagination strategy of this data provider. |
| `getRecords`      | `async (params: GetRecordsParams) => GetRecordsResult` | Responsible for fetching slices of underlying data.     |

### GetRecordsParams

**Properties**

| Name               | Type                                        | Description                                                                   |
| :----------------- | :------------------------------------------ | :---------------------------------------------------------------------------- |
| `paginationModel?` | `PaginationModel`                           | The pagination model that describes the requested slice.                      |
| `filterModel`      | `FilterModel`                               | The filtering model that describes the serverside filter applied to the data. |
| `sortModel`        | `{ field: string; sort: 'asc' \| 'desc'}[]` | The sort model that describes the desired ordering of the result set.         |

### PaginationModel

- `IndexPaginationModel` when `paginationMode` is set to `'index'`.
- `CursorPaginationModel` when `paginationMode` is set to `'cursor'`.

### IndexPaginationModel

**Properties**

| Name       | Type     | Description                                             |
| :--------- | :------- | :------------------------------------------------------ |
| `start`    | `number` | The start index of the requested slice requested slice. |
| `pageSize` | `number` | The length of the requested slice.                      |

### CursorPaginationModel

**Properties**

| Name       | Type     | Description                                                             |
| :--------- | :------- | :---------------------------------------------------------------------- |
| `cursor`   | `number` | The cursor addressing the requested slice. `null` for the initial page. |
| `pageSize` | `number` | The length of the requested slice.                                      |

### FilterModel

**Properties**

| Name            | Type                                                    | Description                                                                                     |
| :-------------- | :------------------------------------------------------ | :---------------------------------------------------------------------------------------------- |
| `logicOperator` | `'and' \| 'or'`                                         | The operator that is applied to the filtering operation.                                        |
| `items`         | `{ field: string; operator: string; value: unknown }[]` | The constituents of the filter, each describes an operation applied to a field in the data set. |

### GetRecordsResult

| Name           | Type             | Description                                                                                                                                                    |
| :------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `records`      | `any[]`          | The start index of the requested slice requested slice.                                                                                                        |
| `totalCount?`  | `number`         | The length of the requested slice.                                                                                                                             |
| `cursor?`      | `string \| null` | Used when `paginationMode` is set to `cursor`. It addresses the next page in the collection. Pass `null` to signal the end of the collection.                  |
| `hasNextPage?` | `boolean`        | You can use this property instead of `totalCount` to signal that more pages are available. This comes in handy when it's not possible to fetch an exact count. |

## Usage

:::info
See [data providers](/toolpad/studio/concepts/data-providers/)
:::
