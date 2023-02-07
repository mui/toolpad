# Data Grid component

<p class="description">Build powerful and feature rich data tables using <a href='https://mui.com/x/react-data-grid' target='_blank' rel="noopener noreferrer">MUI Data Grid</a> component</p>

<img src="/static/toolpad/docs/building-ui/datagrid.png" width="884px" alt="Custom component" />

By default, you can render JSON data using the Data Grid component and it will automatically recognize most of the data types.

## Customizing cell rendering

If this isn't sufficient, you can also render custom components inside the Data Grid.

### Creating custom component

Firstly, you will have to create a custom component which should be able to process `DataGrid` data:

- `value` prop will receive the value of the specific column
- `row` prop will receive the data for the entire row
- `field` prop will receive field configuration data

<img src="/static/toolpad/docs/building-ui/cell-component.png" width="621px" alt="Custom component" />

### Configuring columns

1. Select `DataGrid` component
2. Click on "columns" button

<img src="/static/toolpad/docs/building-ui/edit-columns.png" width="286px" alt="Edit columns" />

3. Choose the column

<img src="/static/toolpad/docs/building-ui/choose-column.png" width="314px" alt="Choose column" />

4. Change type to use codeComponent

<img src="/static/toolpad/docs/building-ui/choose-column-type.png" width="318px" alt="Choose column type" />

5. Choose the custom component that you created

<img src="/static/toolpad/docs/building-ui/choose-cell-component.png" width="306px" alt="Choose component" />
