# Create a number component

<p class="description">You can extend Toolpad with custom code components </p>

Supposing we want to use a component to display a large number value along with a smaller label, like so:

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
