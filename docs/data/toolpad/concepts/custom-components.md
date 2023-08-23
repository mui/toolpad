# Custom components

<p class="description">You can bring your own custom components inside the Toolpad editor.</p>

## `createComponent`

Creating a custom component in Toolpad is a quick process:

1. Start by clicking on Create in the custom component section of the Component library.
2. Name your component.
3. Open the snackbar prompt, it will open up the code editor. In case it doesn't open, check [troubleshoot missing editor.](https://mui.com/toolpad/how-to-guides/editor-path/)

<video controls width="auto" height="100%" style="contain" alt="custom-component-creation">
  <source src="/static/toolpad/docs/concepts/custom-components/custom-component-creation.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

Toolpad exposes a `createComponent` API to bring in custom components to the Toolpad component library.

For example, in `toolpad/components/HelloWorld.tsx`:

```jsx
import * as React from 'react';
import { Typography } from '@mui/material';
import { createComponent } from '@mui/toolpad/browser';

export interface HelloWorldProps {
  msg: string;
}

function HelloWorld({ msg }: HelloWorldProps) {
  return <Typography>{msg}</Typography>;
}

export default createComponent(HelloWorld, {
  argTypes: {
    msg: {
      type: 'string',
      default: 'Hello world!',
    },
  },
});
```

The props defined in the `argTypes` object are available as editable properties when inspecting the custom component:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/custom-components/custom-component-props.png", "alt": "Custom component props ", "caption": "Props of our custom component" }}

## Component Library

Custom components become available in the component library, alongside an option to create a new one.
To use a custom component just drag it to the canvas.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/custom-components/library.png", "alt": "Custom components ", "caption": "Custom components in the library"}}

:::info
You can look at more detailed guides of creating custom components in the how-to guides section:

- [Number](/toolpad/how-to-guides/number-display/)
- [Cube](/toolpad/how-to-guides/cube-component/)
  :::

:::info
Detailed documentation on the API is available in the reference section for [`createComponent`](/toolpad/reference/api/create-component/).
:::
