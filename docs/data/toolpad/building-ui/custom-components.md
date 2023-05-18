# Custom components

<p class="description">When built-in components are not enough to achieve your wanted results build your own using custom components UI.</p>

## Creating a new custom component

In order to create a new custom component open the **Component library** and click the create button under the **custom components** section:

<img src="/static/toolpad/docs/building-ui/ui-10.png?v=0" width="309" alt="Custom component" />

Choose the name for your component and click **Create**:

<img src="/static/toolpad/docs/building-ui/ui-11.png?v=0" width="370" alt="Custom create" />

A snackbar appears acknowledging the successful creation of the component. This will create a code file in the `toolpad/components` folder of the project. Use the **Open** button to start open this file in your code editor:

<img src="/static/toolpad/docs/building-ui/ui-12.png?v=0" width="494" alt="Custom component IDE" />

The file has been initialized with a sample component. Replace its content with the following code:

```tsx
import * as React from 'react';
import { Paper, Typography, Stack } from '@mui/material';
import { createComponent } from '@mui/toolpad/browser';

export interface NumberDisplayProps {
  label: string;
  value: number;
}

function NumberDisplay({ label, value }: NumberDisplayProps) {
  return (
    <Paper sx={{ px: 4, py: 2, width: '100%' }}>
      <Stack sx={{ alignItems: 'center' }}>
        <Typography>{label}</Typography>
        <Typography variant="h3">{value}</Typography>
      </Stack>
    </Paper>
  );
}

export default createComponent(NumberDisplay, {
  argTypes: {
    label: {
      type: 'string',
      default: 'label',
    },
    value: {
      type: 'number',
      default: 0,
    },
  },
});
```

When you now open the **Component library** again you'll see your **NumberDisplay** available.

<img src="/static/toolpad/docs/building-ui/ui-13.png?v=0" width="370" alt="Custom create" />

Drag two of them on the canvas and select the first one. In the **Inspector** you'll see both the `label` and `value` properties available as fully bindable properties.

<img src="/static/toolpad/docs/building-ui/ui-14.png?v=0" width="370" alt="Custom create" />

## Supported features

- Expose props API through `argTypes` definition when using `createComponent` method.
- Import anything from `@mui/*` packages:
  - [@mui/material](https://mui.com/material-ui/getting-started/overview/)
  - [@mui/x-data-grid](https://mui.com/x/react-data-grid/)
  - [@mui/x-date-pickers](https://mui.com/x/react-date-pickers/getting-started/)
  - [@mui/x-data-grid-pro](https://mui.com/x/api/data-grid/data-grid-pro/) (free of charge within Toolpad)
  - [@mui/x-date-pickers-pro](https://mui.com/x/react-date-pickers/getting-started/) (free of charge within Toolpad)
  - [@mui/icons-material](https://mui.com/material-ui/material-icons/)
- 🚧 In progress: import any installed node module.
