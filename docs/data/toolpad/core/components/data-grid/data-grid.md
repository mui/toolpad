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

## Column inferrence

To help you get started quickly, the grid is able to inferrence data provider fields if they are not defined. This allows you to quickly get started with a basic field definition based on the returned data. When a data provider is passed that doesn't have a field definiton, the grid will infer one and show a warning. Click the question mark to show more information on how to solve the warning message. Try copying the snippet from the dialog and paste it in the data provider definition below:

{{"demo": "FieldInferrence.js"}}
