# Custom server

<p class="description">Run Toolpad Studio applications programmatically in existing node.js servers.</p>

:::warning
An improved integration method is being worked on. You'll be able to run Toolpad Studio applications as React server components. If this interests you, please upvote the [feature request](https://github.com/mui/mui-toolpad/issues/3012).
:::

The Toolpad Studio `dev` command comes with its own built-in server. However, sometimes you'd want more control over the way Toolpad Studio applications are hosted within your application. The Toolpad Studio custom server integration API allows you to run a Toolpad Studio application programmatically within an existing node.js server.

:::info
Check out the [example on GitHub](https://github.com/mui/mui-toolpad/tree/master/examples/custom-server) for a full demonstration of how to set up a custom server integration.
:::

The following code illustrates how it works:

```tsx
// ./server.mjs
import { createHandler } from '@toolpad/studio';
import express from 'express';

const app = express();

// Initialize the Toolpad Studio handler. Make sure to pass the base path
const { handler } = await createHandler({
  dev: process.env.NODE_ENV === 'development',
  base: '/my-app',
});

// Use the handler in your application
app.use('/my-app', handler);

app.listen(3001);
```

To run the custom server you'll have to update the scripts in your your package.json

```json
{
  "scripts": {
    "dev": "NODE_ENV=development node ./server.mjs",
    "start": "NODE_ENV=production node ./server.mjs",
    "build": "toolpad-studio build --base /my-app",
    "edit": "toolpad-studio editor http://localhost:3001/my-app"
  }
}
```

Now you can use the corresponding commands to interact with Toolpad Studio in the custom server

| command &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | description                                                                                                                                                                                                         |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `yarn dev`                                               | Run the custom server in dev mode. Similar to opening the application preview when running `toolpad-studio dev`                                                                                                     |
| `yarn start`                                             | Running the Toolpad Studio application in production mode. The application must still be built first with `toolpad-studio build`. Make sure to supply the correct base path.                                        |
| `yarn build`                                             | Builds the application for production purposes. Note that you must supply the correct base path                                                                                                                     |
| `yarn edit`                                              | This runs the Toolpad Studio standalone editor and connects it to your custom server. You can now edit the application and the changes will be reflected in the Toolpad Studio project folder of the custom server. |

:::info
Detailed documentation on the API is available in the reference section for [`createHandler`](/toolpad/studio/reference/api/create-handler/).
:::
