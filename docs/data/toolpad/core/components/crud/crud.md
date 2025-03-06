---
productId: toolpad-core
title: Crud
components: Crud, CrudProvider, List, Show, Create, Edit, CrudForm
---

# Crud

<p class="description">The Crud component provides UIs to interact with data from any data source.</p>

With the `Crud` component and its subcomponents you can easily generate pages where items from your data source can be listed in a table, shown individually in detail, or created and edited with forms. All with minimal configuration from a single data source definition.

## Demo

The `Crud` component automatically generates CRUD pages for your data source, automatically integrated with your routing solution. All that is required is a `dataSource` definition and a `rootPath` for the CRUD pages.

{{"demo": "CrudBasic.js", "height": 600, "iframe": true}}

The pages will be present in the following routes:

- **List**: `/${rootPath}`
- **Show**: `/${rootPath}/:id`
- **Create**: `/${rootPath}/new`
- **Edit**: `/${rootPath}/:id/edit`

These default paths and other out-of-the-box settings can be overriden and configured in more detail by following the [advanced configuration](https://mui.com/toolpad/core/react-crud/#advanced-configuration) below.

It is recommended to include the `dataSourceCache` prop in order to properly cache results from the data source query methods. See more in the section about [data caching](#data-caching) below.

Optionally, additional configuration options can be provided such as `initialPageSize` for the paginated list of items, or `defaultValues` to set the initial form values when using a form to create new items.

:::info
Take a look at our examples for [Next.js](https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs/) and [Vite](https://github.com/mui/toolpad/tree/master/examples/core/vite/) for possible implementations on how the `Crud` component can be integrated with different routing solutions.
:::

## Data sources

A **data source** is an object with a particular shape that must be used to configure the `Crud` component or its subcomponents.
It includes:

- A `fields` property, which extends the [MUI X Data Grid column definition](https://mui.com/x/react-data-grid/column-definition/) where different fields, header names and field types, among others, can be specified for your data. An `id` field (string or number) is mandatory so that individual items can be identified.

- Properties for methods to interact with data such as `getMany`, `getOne`, `createOne`, `updateOne` and `deleteOne`.

- A `validate` function for form validation when creating or editing data, which returns validation errors for each field.

Here is a simplified example of a data source definition:

```tsx
const notesDataSource: DataSource<Note> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    { field: 'text', headerName: 'Text' },
  ],
  getMany: async ({ paginationModel }) => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedNotes = notesStore.slice(start, end);

    return {
      items: paginatedNotes,
      itemCount: notesStore.length,
    };
  },
  getOne: (noteId) => {
    return notesStore.find((note) => note.id === noteId) ?? null;
  },
  createOne: (data) => {
    const newNote = { id: notesStore.length + 1, ...data } as Note;

    notesStore = [...notesStore, newNote];

    return newNote;
  },
  updateOne: (noteId, data) => {
    let updatedNote: Note | null = null;

    notesStore = notesStore.map((note) => {
      if (note.id === noteId) {
        updatedNote = { ...note, ...data };
        return updatedNote;
      }
      return note;
    });

    return updatedNote;
  },
  deleteOne: (noteId) => {
    notesStore = notesStore.filter((note) => note.id !== noteId);
  },
  validate: (formValues) => {
    let issues: { message: string; path: [keyof Note] }[] = [];

    if (!formValues.title) {
      issues = [...issues, { message: 'Title is required', path: ['title'] }];
    }
    if (!formValues.text) {
      issues = [...issues, { message: 'Text is required', path: ['text'] }];
    }

    return { issues };
  },
};
```

### `getMany`

The `getMany` method in a data source can be used for retrieving paginated, sorted and filtered items to be displayed as a list, usually in a table.

Pagination, sorting and filtering can be integrated with your data fetching via the `paginationModel`, `filterModel` and `sortModel` arguments. These arguments follow the same shape as the models for [pagination](https://mui.com/x/react-data-grid/pagination/#pagination-model), [sorting](https://mui.com/x/react-data-grid/sorting/#structure-of-the-model) and [filtering](https://mui.com/x/react-data-grid/filtering/#structure-of-the-model) used by the MUI X Data Grid.

This method must return an array of objects with the items to be displayed.

```tsx
{
  //...
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    // Fetch data from server
    const data = await fetch('https://my-api.com/data', {
      method: 'GET',
      body: JSON.stringify({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortModel,
        filterModel,
      }),
    });

    return data
  },
  // ...
}
```

### `getOne`

The `getOne` method in a data source can be used for retrieving a single specific item and displaying all of its attributes.

This method must return an object corresponding to the item to be displayed.

```tsx
{
  //...
  getOne: (id) => {
    // Fetch record from server
    const record = await fetch(`https://my-api.com/data/${id}`, {
      method: 'GET',
    });

    return record;
  },
  // ...
}
```

### `createOne`

The `createOne` method in a data source can be used for creating a new item, usually from a form where the value for each of its attributes can be specified.

This method must return an object corresponding to the new item that has been created.

```tsx
{
  //...
  createOne: (data) => {
    // Create record in the server
    const record = await fetch('https://my-api.com/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return record;
  },
  // ...
}
```

### `updateOne`

The `updateOne` method in a data source can be used for updating an existing item, usually from a form where the value for each of its attributes can be specified.

This method must return an object corresponding to the new item that has been updated.

```tsx
{
  //...
  updateOne: (id, data) => {
    // Update record in the server
    const record = await fetch(`https://my-api.com/data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return record;
  },
  // ...
}
```

### `deleteOne`

The `deleteOne` method in a data source can be used for deleting an existing item.

This method does not need to return anything.

```tsx
{
  //...
  deleteOne: (id) => {
    // Delete record in the server
    await fetch(`https://my-api.com/data/${id}`, {
      method: 'DELETE',
    });
  },
  // ...
}
```

### Form validation

Optionally, a `validate` function can be included in the data source in order to do form validation.

This function follows the [Standard Schema](https://standardschema.dev/), so it takes an object with field values for a given item and must return the corresponding errors for each field, as shown in the example:

```tsx
{
  //...
  validate: (formValues) => {
    let issues = [];

    if (!formValues.name) {
      issues = [...issues, { message: 'Name is required', path: ['name'] }];
    }
    if (formValues.age < 18) {
      issues = [...issues, { message: 'Age must be higher than 18', path: ['age'] }];
    }

    return { issues };
  },
  // ...
}
```

This function will run automatically against the current values when the user tries to submit a form inside the `Crud` component, or changes any of its fields.

#### Integration with external schema libraries

The `validate` function can easily be integrated with any schema libaries that follow the [Standard Schema](https://standardschema.dev/) spec, such as [`zod`](https://github.com/colinhacks/zod).

Here's an example using `zod`:

```tsx
import { z } from 'zod';

const dataSource = {
  // ...
  validate: z.object({
    name: z.string().min(1, 'Name is required'), // Equivalent to required
    age: z.number().min(18, 'Age must be higher than 18'),
  })['~standard'].validate,
  // ...
};
```

## Data caching

Data sources cache fetched data by default. This means that if the user queries data that has already been fetched, query methods such as `getMany` and `getOne` will not be called again to avoid unnecessary calls to the server.

Successfully calling mutation methods such as `createOne`, `updateOne` or `deleteOne` automatically clears the cache for all queries in the same data source.

It is recommended to always include the `dataSourceCache` prop in order to cache data at the scope of whole application, otherwise by default the cache will only be scoped to the component being used.
Each data source should have its own single cache instance across the whole application.

An instance of `DataSourceCache` may be used for caching as seen in the [demo above](#demo). `DataSourceCache` is a simple in-memory cache that stores the data in a plain object.

### Disable cache

To disable the data source cache, pass `null` to the `dataSourceCache` prop.

{{"demo": "CrudNoCache.js", "height": 600, "iframe": true}}

## Advanced configuration

For more flexibility of customization, and especially if you want full control over where to place the different CRUD pages, you can use the `List`, `Show`, `Create` and `Edit` subcomponents instead of the all-in-one `Crud` component.

{{"demo": "CrudAdvanced.js", "height": 600, "iframe": true}}

The `CrudProvider` component is optional, but it can be used to easily pass a single `dataSource` and `dataSourceCache` to the CRUD subcomponents inside it as context.
Alternatively, each of those components can take its own `dataSource` and `dataSourceCache` as props.

### `List` component

Displays a [Data Grid](https://mui.com/x/react-data-grid/) listing items from a data source, with support for pagination, sorting and filtering, along with some useful controls such as refreshing data.

If props are passed for `onCreateClick` or `onEditClick`, buttons are shown for triggering those callbacks.

If the data source includes `deleteOne`, it is possible to delete items directly from their respective rows.

{{"demo": "CrudList.js", "height": 600, "iframe": true}}

#### Integration with MUI X Data Grid

The `dataGrid` slot and slot props can be used to replace the standard Data Grid with any of its [commercially licensed versions](https://mui.com/x/react-data-grid/#commercial-licenses).

{{"demo": "CrudListDataGrid.js", "height": 600, "iframe": true}}

### `Show` component

Displays details for an item with a given `id` retrieved from a data source.

If a prop is passed for `onEditClick`, a button is shown for triggering that callback.

If the data source includes `deleteOne`, it is possible to delete items directly from this view.

{{"demo": "CrudShow.js", "height": 600, "iframe": true}}

### `Create` component

Displays a form for creating a new item for a data source, automatically generated from the given `fields` and field `type`s.

The supported field types are `string`, `number`, `boolean`, `date`, `dateTime` and `singleSelect`.

Form validation integrates automatically with the `validate` function in the data source.

{{"demo": "CrudCreate.js", "height": 600, "iframe": true}}

### `Edit` component

Displays a form for editing an item with a given `id` retrieved from a data source, similarly to the `Create` component.

The form fields are prepopulated with the item's attributes.

{{"demo": "CrudEdit.js", "height": 600, "iframe": true}}
