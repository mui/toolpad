# DataGrid component

<p class="description">Build powerful and feature rich data tables</p>

<img src="/static/toolpad/docs/building-ui/datagrid.png" width="884px" alt="Custom component" />

## Customizing cell rendering

By default you can render data json using DataGrid component and it will automatically recognize most of the data types. However sometimes it might not be enough and for that reason we provide option to use custom components to render the data.

### Creating custom component

First you will have to create custom component which is able to process `DataGrid` data:

- `value` prop will recieve the value of the specific column
- `row` prop will recieve the date for the entire row
- `field` prop will recieve field confifuration data

<img src="/static/toolpad/docs/building-ui/cell-component.png" width="621px" alt="Custom component" />

### Configuring columns

1. Select `DataGrid` component
2. Click on columns edit button

<img src="/static/toolpad/docs/building-ui/edit-columns.png" width="286px" alt="Edit columns" />

3. Choose the column

<img src="/static/toolpad/docs/building-ui/choose-column.png" width="314px" alt="Choose column" />

4. Change type to use codeComponent

<img src="/static/toolpad/docs/building-ui/choose-column-type.png" width="318px" alt="Choose column type" />

5. Choose custom component that you created

<img src="/static/toolpad/docs/building-ui/choose-cell-component.png" width="306px" alt="Choose component" />
