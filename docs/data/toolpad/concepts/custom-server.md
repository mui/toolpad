# Custom server

<p class="description">Run Toolpad applications programmatically in existing node.js servers.</p>

The Toolpad `dev` command comes with its own server. Sometimes you'd want more control over the way Toolpad applications are hosted within your application. The Toolpad custom server integration API allows you to run a Toolpad application programmatically within your existing node.js server.

The following code illustrates how this works:

```tsx
// ./server.mjs
import { unstable_createHandler as createHandler } from '@mui/toolpad';
import express from 'express';

const app = express();

// Initialize the Toolpad handler. Make sure to pass the base path
const { handler } = await createHandler({
  dev: process.env.NODE_ENV === 'development',
  base: '/my-app',
});

// Use the handler in your application
app.use('/my-app', handler);

app.listen(3001);
```

To run the custom server you'll have to update your package.json

```json
{
  "scripts": {
    "dev": "NODE_ENV=development node ./server.mjs",
    "start": "NODE_ENV=production node ./server.mjs",
    "build": "toolpad build --base /my-app",
    "edit": "toolpad editor http://localhost:3001/my-app"
  }
}
```

Now you can use the corresponding commands to interact with Toolpad in the custom server

| command      | description                                                                                                                                             |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `yarn dev`   | Run the custom server in dev mode. Similar to opening the application preview when running `toolpad dev`                                                |
| `yarn start` | Running the Toolpad application in production mode. The application must have been built with `toolpad build`                                           |
| `yarn build` | Builds the application for production purposes. Note that you must supply the correct base path                                                         |
| `yarn edit`  | This runs the Toolpad standalone editor and connects it to your custom server. You can now edit the application and the custom server will be modified. |
