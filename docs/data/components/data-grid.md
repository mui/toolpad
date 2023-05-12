<!-- This file has been auto-generated. Do not modify manually. -->

# DataGrid

<p class="description">API docs for the Toolpad DataGrid component.</p>

The MUI X [Data Grid](https://mui.com/x/react-data-grid/) component.

The datagrid lets users display tabular data in a flexible grid.

## Properties

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|`
| rows | array |  | The data to be displayed as rows. Must be an array of objects. |
| columns | array |  |  |
| rowIdField | string |  | Defines which column contains the [id](https://mui.com/x/react-data-grid/row-definition/#row-identifier) that uniquely identifies each row. |
| selection | object | null | The currently selected row. Or `null` in case no row has been selected. |
| density | string | "compact" | The [density](https://mui.com/x/react-data-grid/accessibility/#density-prop) of the rows. Possible values are `compact`, `standard`, or `comfortable`. |
| height | number | 350 |  |
| loading | boolean |  | Displays a loading animation indicating the datagrid isn't ready to present data yet. |
| hideToolbar | boolean |  | Hide the toolbar area that contains the data grid user controls. |
| sx | object |  | The [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/) is used for defining custom styles that have access to the theme. All MUI system properties are available via the `sx` prop. In addition, the `sx` prop allows you to specify any other CSS rules you may need. |