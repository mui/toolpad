# DataGrid

<p class="description">Learn about a DataGrid component and how to use it in Toolpad.</p>

## Demo

The DataGrid presents information in a structured format of rows and columns. The data is displayed in a user-friendly, quick-to-scan and interactive way, enabling users to efficiently identify patterns, edit data, and gather insights. Detailed documentation of the component properties is available in the reference section for [datagrid](/toolpad/reference/components/data-grid/#properties).

{{"demo": "DataGrid.js", "hideToolbar": true, "bg": "inline"}}

## Appearance

### Density

Density prop supports three options: Compact, Standard and Comfortable. First two are shown below:

#### Compact

{{"demo": "DataGrid.js", "hideToolbar": true, "bg": "inline"}}

#### Standard

{{"demo": "DataGrid_standard.js", "hideToolbar": true, "bg": "inline"}}

### HideToolbar

This prop is used to show/hide the header toolbar from the data grid.

{{"demo": "DataGrid_hidetoolbar.js", "hideToolbar": true, "bg": "inline"}}

## Usage

A Data Grid is an essential component in an internal application. Following properties make it usable to work alongside other Toolpad components, queries, data providers.

### Rows

Rows property requires an array of data to show inside the data grid. It can be configured either by clicking on it and providing JSON or by binding it to a query output. The video below shows how to bind data to data grid using rows linking:

<video controls width="100%" height="auto" style="contain" alt="datagrid-rows">
  <source src="/static/toolpad/docs/components/datagrid/datagrid_rows.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Columns

Columns property is used to configure the columns to be displayed. Choose a column and you'll get a pop-up window to configure its header name, width, alignment and data type.
From the `type` drop down you can also [customize a column](/toolpad/how-to-guides/customize-datagrid/).

<video controls width="100%" height="auto" style="contain" alt="datagrid-columns">
  <source src="/static/toolpad/docs/components/datagrid/datagrid_column.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Id field

Id field property is used to identify which column contains the id column. By default, the data grid looks for a property named `id` in the data set to get that identifier. If the row's identifier is not called `id`, then you need to use this prop to tell the data grid where it's located.

### Selection

This property shows the currently selected row or `null` in case no row has been selected. It is available to be bound to take any action on the selected row like [deleting a row](/toolpad/how-to-guides/delete-datagrid-row/) from data grid.

<video controls width="100%" height="auto" style="contain" alt="datagrid-selection">
  <source src="/static/toolpad/docs/components/datagrid/datagrid_selection.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Loading

Loading property is used to to inform the user when the data is being prepared. It can be [bound to](/toolpad/how-to-guides/delete-datagrid-row/#configure-loading-states-optional) React query properties like isFetching, isLoading.

<video controls width="100%" height="auto" style="contain" alt="datagrid-loading">
  <source src="/static/toolpad/docs/components/datagrid/datagrid_loading.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
