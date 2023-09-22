# DataGrid

<p class="description">Learn about a DataGrid component and how to use it in Toolpad.</p>

The DataGrid presents information in a structured format of rows and columns. The data is displayed in a user-friendly, quick-to-scan and interactive way, enabling users to efficiently identify patterns, edit data, and gather insights. Detailed documentation of the component properties is available in the reference section for [datagrid](/toolpad/reference/components/data-grid/#properties).

The video below shows data grid features in preview mode in Toolpad:

<video controls width="100%" height="auto" style="contain" alt="button-onclick-js-expression">
  <source src="/static/toolpad/docs/components/datagrid/datagrid.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Variations

There are two data grid properties density and hide toolbar that can change the visual appearance of a data grid.

{{"demo": "DataGrid.js", "hideToolbar": true}}

## Usage

A Data Grid is an essential component in an internal app. Following properties make it usable to work alongside other Toolpad entities.

### Rows

Rows property requires an array of data to show inside the data grid. It can be configured either by clicking on it and providing JSON or by binding it to a query output.

### Columns

Columns property is used to configure the columns to be displayed. Choose a column and you'll get a pop-up window to configure its header name, width, alignment and data type.
From the `type` drop down you can also [customize a column](/toolpad/how-to-guides/customize-datagrid/).

### Id field

Id field property is used to identify which column contains the id column. By default, the data grid looks for a property named `id` in the data set to get that identifier. If the row's identifier is not called `id`, then you need to use this prop to tell the data grid where it's located.

### Selection

This property shows the currently selected row or `null` in case no row has been selected. It is available to be bound to take any action on the selected row like [deleting a row](/toolpad/how-to-guides/delete-datagrid-row/) from data grid.

### Loading

Loading property is used to to inform the user when the data is being prepared. It can be bound to React query properties like isFetching, isLoading.
