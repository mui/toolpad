# Data Grid component

<p class="description">Render powerful and feature rich data tables.</p>

<img src="/static/toolpad/docs/building-ui/datagrid.png" width="884" alt="Custom component" />

By default, you can render JSON data using the Data Grid component and it will automatically recognize most of the data types.
Toolpad is built-in with the [MUI X Data Grid](https://mui.com/x/react-data-grid/) component.

## Customizing cell rendering

If the default column options aren't sufficient, you can also render custom components inside the Data Grid.

### Creating custom component

First, you'll have to [create a custom component](/toolpad/building-ui/custom-components/#creating-a-new-custom-component). Your component will receive the following props

- `value` prop will receive the value of the specific column
- `row` prop will receive the data for the entire row
- `field` prop will receive the field name

### Configuring columns

1. Select **Data Grid** component
2. Click on "columns" button

<img src="/static/toolpad/docs/building-ui/edit-columns.png" width="286" alt="Edit columns" />

3. Choose the column

<img src="/static/toolpad/docs/building-ui/choose-column.png" width="314" alt="Choose column" />

4. Change type to use codeComponent

<img src="/static/toolpad/docs/building-ui/choose-column-type.png" width="318" alt="Choose column type" />

5. Choose the custom component that you created

<img src="/static/toolpad/docs/building-ui/choose-cell-component.png" width="306" alt="Choose component" />
