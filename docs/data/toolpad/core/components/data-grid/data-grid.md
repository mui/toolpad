---
productId: toolpad-core
title: App Provider
components: DataGrid, DataProvider
---

# Data Grid

<p class="description">Data Grid component for CRUD applications.</p>

Toolpad core extends the X grid with CRUD functionality. It abstracts the manipulations in a data provider object. The data provider object describes the shape of the data and the available manipulations. When you pass the data provider to a grid it is automatically configured as a CRUD grid. All properties of the X grid are also available and can be used to override the data provider behavior.

Where core and X components focus on the user interface. Toolpad core components start from a definition of the data. It centralizes data loading, filtering, pagination, field formatting, mutations, access control and more.

## Basic

The simplest data provider exposes a `getMany` function and a `fields` definition. This is enough for a grid to render the rows.

{{"demo": "BasicDataProvider.js"}}

## Override columns

The Toolpad core grid adopts the fields that are defined in its data provider. This is handy because it allows for sharing formatting and validation options between data rendering components. But it is still possible to override the defaults at the level of an individual grid. The grid will adopt the columns you've defined in the `columns` property, and set default values for the individual column options for eac of them.

{{"demo": "OverrideColumns.js"}}

## Column inferrence

To help you get started quickly, the grid is able to inferrence data provider fields if they are not defined. This allows you to quickly get started with a basic field definition based on the returned data. When a data provider is passed that doesn't have a field definiton, the grid will infer one and show a warning. Click the question mark to show more information on how to solve the warning message. Try copying the snippet from the dialog and paste it in the data provider definition below:

{{"demo": "FieldInferrence.js"}}

## Serverside pagination

By default the grid paginates items client side. If your backend supports serverside pagination, enable it with the `paginationMode` flag in the data provider. Now the `getMany` method will receive a `pagination` parameter. This parameter is an object containing a `start` and `pageSize` propety that denote the start index and offset for the requested page. You can optionally send a `rowCount` along with the `rows`.

{{"demo": "ServerSidePagination.js"}}

You can decide whether your data provider supports pagination exclusively or optionally by throwing an error when `pagination` is `null`.

## CRUD

The data provider

### create

{{"demo": "CrudCreate.js"}}

### update

{{"demo": "CrudUpdate.js"}}

### delete

{{"demo": "CrudDelete.js"}}

## 🚧 Input validation

For create and update logic, the data provider supports validation

### 🚧 Static

In the field definitions, with e.g. a `required` property.

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
