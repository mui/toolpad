---
productId: toolpad-core
title: Crud
components: Crud, CrudProvider, List, Show, Create, Edit
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

Optionally, additional configuration options can be provided such as `initialPageSize` for the paginated list of items, or `defaultValues` to set the initial form values when using a form to create new items.

:::info
Take a look at our examples for [Next.js](https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs/) and [Vite](https://github.com/mui/toolpad/tree/master/examples/core/vite/) for possible implementations on how the `Crud` component can be integrated with different routing solutions.
:::

## Data sources

A **data source** is an object with a particular shape that must be used to configure the `Crud` component or its subcomponents.
It includes:

- A `fields` property, which extends the [MUI X Data Grid column definition](https://mui.com/x/react-data-grid/column-definition/) where different fields, header names and field types, among others, can be specified for your data.

  An `id` field (string or number) is mandatory so that individual items can be identified.

  An additional type `longString` is provided for multiline form fields.

- Properties for methods to interact with data such as `getMany`, `getOne`, `createOne`, `updateOne` and `deleteOne`.

- A `validate` function for form validation when creating or editing data, which returns validation errors for each field.

Here is a simplified example of a data source definition:

```tsx
const notesDataSource: DataSource<Note> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    { field: 'text', headerName: 'Text', type: 'longString' },
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
    const errors: Record<keyof Note, string> = {};

    if (!formValues.title) {
      errors.title = 'Title is required';
    }
    if (!formValues.text) {
      errors.text = 'Text is required';
    }

    return errors;
  },
};
```

### `getMany`

The `getMany` method in a data source can be used for retrieving paginated, sorted and filtered items to be displayed as a list, usually in a table.

Pagination, sorting and filtering can be integrated with your data fetching via the `paginationModel`, `filterModel` and `sortModel` arguments. These arguments follow the same shape as the models for [pagination](https://mui.com/x/react-data-grid/pagination/#pagination-model), [sorting](https://mui.com/x/react-data-grid/sorting/#structure-of-the-model) and [filtering](https://mui.com/x/react-data-grid/filtering/#structure-of-the-model) used by the **MUI X Data Grid**.

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

This method does not need to return anything in specific.

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

## Advanced configuration

// show composability usage

### `List` component

### `Show` component

### `Create` component

### `Edit` component
