---
productId: toolpad-core
title: CRUD
components: CRUD, CRUDProvider, List, Show, Create, Edit
---

# CRUD

<p class="description">The CRUD component provides UIs to interact with data from any data source.</p>

With the `CRUD` component and its subcomponents you can easily generate pages where items from your data source can be listed in a table, shown individually in detail, or created and edited with forms. All with minimal configuration from a single data source definition.

## Demo

The `CRUD` component automatically generates CRUD pages for your data source, automatically integrated with your routing solution. All that is required is a `dataSource` definition and a `rootPath` for the CRUD pages.

{{"demo": "CRUDBasic.js", "height": 600, "iframe": true}}

Optionally, other configuration options can be provided such as `initialPageSize` for the paginated list of items, or `defaultValues` to set the initial form values when using a form to create or edit items.

## Data sources

A **data source** is an object with a particular shape that must be used to configure the `CRUD` component or its subcomponents.
It includes:

- A `fields` property, analogous to the [MUI X Data Grid column definition](https://mui.com/x/react-data-grid/column-definition/) where different fields, header names and field types, among others, can be specified for your data.
- Properties for methods to interact with data such as `getMany`, `getOne`, `createOne`, `updateOne` and `deleteOne`.
- A `validate` function for form validation when creating or editing data, which returns validation errors for each field.

Here is a simple example of a data source:

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

    resolve({
      items: paginatedNotes,
      itemCount: notesStore.length,
    });
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

    return null;
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

## Listing data
