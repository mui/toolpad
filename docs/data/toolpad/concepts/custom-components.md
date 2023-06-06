# Custom components

<p class="description">You can bring your own custom components inside the Toolpad editor</p>

## `createComponent`

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

You can import anything from these `@mui/` libraries when defining custom components:

- `@mui/material`
- `@mui/x-data-grid`
- `@mui/x-date-pickers`
- `@mui/x-data-grid-pro`
- `@mui/x-date-pickers-pro`
- `@mui/icons-material`

:::warning
Support for importing any `npm` package is not implemented yet. It's coming.

👍 Upvote [issue #362](https://github.com/mui/mui-toolpad/issues/362) if you want to see it land faster.
:::

:::info
Detailed documentation on the API is available in the reference section for [`createComponent`](/toolpad/reference/api/create-component/).
:::

## Component Library

Custom components become available in the component library, alongside an option to create a new one.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/custom-components/library.png", "alt": "Custom components ", "caption": "Custom components in the library"}}
