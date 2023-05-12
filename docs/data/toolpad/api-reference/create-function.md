# createFunction

<p class="description">Provide backend function that load data on the page.</p>

## Data Loading

Make any backend data available to your page with the `createFunction`. Define a named export, initialized with `createFunction` in `toolpad/resources/functions.ts`. After doing so, the function will be available when creating a Custom Function query on the page. The result of calling this function on the backend will be available as page state.

You can define parameters to bind to page state. The actual values for these parameters will be supplied when the function is called to load the data.

## Example

```tsx
// ./toolpad/resources/functions.ts
import { createFunction } from '@mui/toolpad/server';

export const myFunction = createFunction(
  async ({ parameters }) => {
    return `My message: ${parameters.message}`;
  },
  {
    parameters: {
      message: {
        typeDef: { type: 'string' },
      },
    },
  },
);
```
