# Create a number component

<p class="description">You can extend Toolpad with custom code components </p>

We can create a custom component to display a large number value along with a smaller label, like so:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/custom-components/number/component.png", "alt": "Number component", "caption": "The number component"}}

## Creating the component

### In the Toolpad editor

1. To get started creating this, hover over the component library and click on the **Create** button in the **Custom Components** section.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/custom-components/create-custom.png", "alt": "Create custom component", "caption": "Create a custom component", "zoom": false }}

2. A dialog box appears asking you to name it. Name it "NumberDisplay".

   :::warning
   You can use any name, as long as it is unique and complies with the [rules of naming](https://react.dev/learn/your-first-component) components in React
   :::

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/custom-components/number/display-name.png", "alt": "Name custom component", "caption": "Naming a custom component", "zoom": false, "width": 300 }}

3. A snackbar appears acknowledging the successful creation of the component. A starter file is created in `toolpad/components`. Use the **Open** button to open this file in your code editor:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/custom-components/number/snackbar-open.png", "alt": "Open custom component", "caption": "Open the custom component", "zoom": false, "width": 400 }}

### In the code editor

1. A file with some sample code for a custom component is initialised for you. Replace its content with the following code:

   ```jsx
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

   `label` and `value` are the props that we will make available for binding in the Toolpad editor.

2. **NumberDisplay** is now available as a custom component in the component library:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/custom-components/number/in-library.png", "alt": "number component in library", "caption": "The number component appears in the component library", "width": 300, "zoom": false }}

## Using the component

1. Drag two of the number components on the canvas and select the first one. In the inspector, you'll see both the `label` and `value` properties available as bindable properties.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/custom-components/number/components.png", "alt": "Use number components with numbers and labels", "caption": "Using the number component", "indent": 1 }}
