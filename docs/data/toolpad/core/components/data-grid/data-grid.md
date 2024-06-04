---
productId: toolpad-core
title: DataGrid
components: DataGrid, DataProvider
---

# Data Grid

<p class="description">Data Grid component for CRUD ("Create Read Update Delete") applications.</p>

Toolpad Core extends the [X data grid](https://mui.com/x/react-data-grid/) with CRUD functionality. It abstracts the manipulations in a data provider object. The data provider object describes the shape of the data and the available manipulations. When you pass the data provider to a grid it is automatically configured as a CRUD grid. All properties of the X grid are also available and can be used to override the data provider behavior.

Where Core and X components focus on the user interface, Toolpad Core components start from a definition of the data. It centralizes data loading, filtering, pagination, field formatting, mutations, access control and more.

## Basic

The simplest data provider exposes a `getMany` function and a `fields` definition. This is enough for a grid to render the rows.

{{"demo": "BasicDataProvider.js"}}

## Override columns

The Toolpad Core grid adopts the fields that are defined in its data provider. This is handy because it allows for sharing formatting and validation options between data rendering components. However, it is still possible to override the defaults at the level of an individual grid. The grid adopts the columns you've defined in the `columns` property, and sets default values for the individual column options for each of them.

{{"demo": "OverrideColumns.js"}}

## Column inference

To help you get started quickly, the grid is able to infer data provider fields if they are not defined. This allows you to quickly get started with a basic field definition based on the returned data. When a data provider is passed that doesn't have a field definiton, the grid infers field definitions and shows a warning. Click the question mark to show more information on how to solve the warning message. Try copying the snippet from the dialog and paste it in the data provider definition below:

{{"demo": "FieldInference.js"}}

## Server-side Pagination

By default the grid paginates items client-side. If your backend supports server-side pagination, enable it with the `paginationMode` flag in the data grid. Now the `getMany` method receives a `pagination` parameter. This parameter is an object containing a `start` and `pageSize` property that denote the start index and offset for the requested page. You can optionally send a `rowCount` along with the `rows`.

{{"demo": "ServerSidePagination.js"}}

You can decide whether your data provider supports pagination exclusively or optionally by throwing an error when `pagination` is `null`.

## Server-side Filtering

By default, the grid filters rows client-side. If your backend supports filtering, you can enable it with the `filterMode` property in the data grid. To pass a `filter` to the data provider, set `filterMode` to `'server'`.

```js
async getMany({ filter }) {
  const url = new URL('https://api.example.com/data');
  for (const [field, ops = {}] of Object.entries(filter)) {
    for (const [operator, value] of Object.entries(ops)) {
      url.searchParams.append(field, `${operator}:${value}`);
    }
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return { rows: await res.json() };
},
```

## CRUD

The data provider supports all basic CRUD operations

### Create a row

When you add a `createOne` method to the data provider, the grid gets a "Add record" button in the Toolbar. When you click this button, a draft row shows wich you can fill with values for the created item. To commit the new row, click the save button. This calls the `createOne` function with the values that were filled. When the operation finishes, a notification shows.

{{"demo": "CrudCreate.js"}}

### Update a row

When you add a `updateOne` method to the data provider, the grid gets edit buttons in its action column. When you click this button, the row goes in editing mode. When you click the save button, the `updateOne` method is called with the row id as first parameter and the changed values as the second parameter. When the operation finishes, a notification shows.

{{"demo": "CrudUpdate.js"}}

### Delete a row

When you add a `deleteOne` method to your data provider, the grid gets delete buttons in its action column. When you click this button, the `deleteOne` method is called with the id of the relevant row. When the operation finishes, a notification shows.

{{"demo": "CrudDelete.js"}}

### 🚧 Delete multiple rows

When the data provider contains a `deleteMany` method, the grid allows for multiple selection and delete.

## 🚧 Input validation

For create and update logic, the data provider supports validation

### 🚧 Static

In the field definitions, with for example a `required` property.

```js
fields: {
  name: {
    required: true,
    validate: (value) => value.length < 10 ? null : 'Too long'
  },
}
```

### 🚧 Dynamic

In the `updateOne`/`createOne` method, by throwing a specific error.

```js
throw new ValidationError({
  name: 'Already exists',
});
```

## 🚧 Premium/pro grid

An X premium and pro version of the grid are exported from the `@toolpad/enterprise` package. An X license is required accordingly.

## 🚧 Access control

The data provider integrates with Toolpad access control to enable/disable CRUD features based on the current user roles.
