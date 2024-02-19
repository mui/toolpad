# Customize data grids

<p class="description">Toolpad is built to allow extensibility as a first-class citizen.</p>

## Default behavior

By default, you can connect any JSON data to a Toolpad data grid and it will attempt to guess each column's type display it appropriately:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/customize-datagrid/datagrid.png", "alt": "Data grid with data", "caption": "The default data grid showing multiple data types", "aspectRatio": 3 }}

## Customizing cell rendering

However, if the default column options are not sufficient, Toolpad allows you to customize your data grid with custom components, using the powerful features of the <a href="https://mui.com/x/react-data-grid/">MUI X Data Grid</a>.

### Creating a custom component

Suppose we want to display only the first eight characters of the Order ID in a `<Chip>`, and show the full text on hover, in a `<Tooltip>`.

We'll create a custom component to achieve this.

:::info
Follow the how-to guide on [creating a custom component](/toolpad/concepts/custom-components/) if you want to learn more.
:::

A custom component that renders inside the data grid receives a `params` object as a prop, containing the following values:

- `value` : the value of the specific cell
- `row`: the value of the entire row
- `field`: the name of the field for that specific column

Using the `value` prop, we can create a custom component like the following:

```jsx
import * as React from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { createComponent } from '@mui/toolpad/browser';

export interface OrderIdChipProps {
  value: string;
}

function OrderIdChip({ value }: OrderIdChipProps) {
  return (
    <Tooltip title={value}>
      <Chip label={value.slice(0, 7)} />
    </Tooltip>
  );
}

export default createComponent(OrderIdChip, {
  argTypes: {
    value: {
      type: 'string',
      default: '',
    },
  },
});
```

The `OrderIdChip` component should appear in our component library on saving:

### Configuring custom components in the data grid

1. Select the data grid and choose the **columns** property in the inspector:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/customize-datagrid/columns.png", "alt": "Customize data grid columns", "caption": "The columns editor", "indent": 1 }}

2. Choose **Order ID** and change its type to be `codeComponent`:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/customize-datagrid/code-component-column.png", "alt": "Code component column", "caption": "Setting the column type", "indent": 1 }}

3. Choose the `OrderIdChip` column in the select menu for custom component:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/customize-datagrid/order-id-column.png", "alt": "Custom component selector", "caption": "Choosing the custom component we created", "indent": 1 }}

4. That's it! We have the desired functionality:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/customize-datagrid/chip-column.gif", "alt": "Custom chip inside data grid", "caption": "Using our custom component in the data grid", "indent": 1, "aspectRatio": 3 }}
