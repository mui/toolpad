# Custom Functions

<p class="description">These offer a fast way to bring your existing functions to a Toolpad Studio page.</p>

The most powerful way of bringing data into Toolpad Studio is through your own code. You can define functions inside `toolpad/resources` and use them when creating a query of this type. The following video shows how you can use this feature to read data from PostgreSQL.

<video controls width="auto" height="100%" style="contain" alt="custom-function">
  <source src="/static/toolpad/docs/studio/concepts/connecting-to-data/postgres.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Function editor

- ### Function

  This corresponds to a function that you create on your file system, inside the `toolpad/resources` folder. For example, the default function in `toolpad/resources/functions.ts` looks like:

  ```jsx
  export default async function handler(message: string) {
    return `Hello ${message}`;
  }
  ```

<ul>
<li style="list-style-type: none">
Toolpad Studio custom functions run fully server-side in Node. For example, if you change the content of the above example to:

```jsx
export async function example() {
  return process.versions;
}
```

You get the following response:

</li>
</ul>

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-8.png", "alt": "Server-side values", "caption": "Using server-side values in custom functions", "indent": 1, "aspectRatio": 6 }}

<ul>

<li style="list-style-type: none">

> You can import and use any Node module in your custom functions.

</li>
</ul>

### Parameters

To be really useful, you need to connect these queries with data present on your page. You can do so by creating **parameters.**

All function arguments will be available in the query editor to bind state to. Make sure to annotate them correctly with their TypeScript types. Toolpad Studio uses this information to present you with correctly typed databinding controls. For example:

```jsx
export async function getAnimals(
  species: 'cat' | 'dog' | 'rabbit',
  name: string,
  minAge: number,
) {
  return db.queryAnimals({
    species,
    name,
    age: { min: minAge },
  });
}
```

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-9.png", "alt": "Controls for custom function parameters", "caption": "Controls for custom function parameters", "indent": 1,  "aspectRatio": 6}}

:::info
Toolpad Studio also provides a `createFunction` API to be able to define your parameters when creating custom functions:

```jsx
import { createFunction } from '@toolpad/studio/server';

export const example = createFunction(
  async ({ parameters }) => {
    return {
      message: `3 x ${parameters.value} = ${parameters.value * 3}`,
    };
  },
  {
    parameters: {
      value: {
        type: 'number',
      },
    },
  },
);
```

This will make the `value` property available in the query editor. You can pass a value, or bind this to the page state:

This API is now deprecated, and will be removed from a future version of Toolpad Studio. Find more details in the `createFunction` [reference](/toolpad/studio/reference/api/create-function/) section.
:::

## Secrets handling

Toolpad Studio has access to the environment variables defined in the `.env` file at the root of the project.

You can even directly use the environment variables when defining custom functions, as you normally would when writing backend code. For example:

```bash
OPENAI_API_KEY=...
```

And you can then use them in a custom function like so:

```ts
import { Configuration, OpenAIApi } from 'openai';

export async function askGPT(messages: string[]) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: messages,
  });

  const response = completion.data?.choices[0].message ?? {
    role: 'assistant',
    content: 'No response',
  };

  return response;
}
```

You can then use this function on your page:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/ask-gpt.gif", "alt": "Custom function with secret", "caption": "Using a custom function with environment variables", "indent": 1 }}

## Request context

When you run Toolpad Studio in an authenticated context it may be useful to be able to access authentication information in backend functions. For this purpose we offer the `getContext` API which allows you to inspect the cookies of the request that initiated the backend function.

### Access cookies with `context.cookies`

```jsx
import { getContext } from '@toolpad/studio/server';
import { parseAuth } from '../../src/lib/auth';

export async function myBackendFunction() {
  const ctx = getContext();
  const user = await parseAuth(ctx.cookie.authentication);
  return user?.id;
}
```

### Write cookies with `context.setCookie`

You can also use the context to set a cookie, which can subsequently be used in other backend functions called from your Toolpad Studio application. Example:

```jsx
import { getContext } from '@toolpad/studio/server';
import * as api from './myApi';

const MY_COOKIE_NAME = 'MY_AUTH_TOKEN';

export async function login(user: string, password: string) {
  const token = await api.login(user, password);
  const { setCookie } = getContext();
  setCookie(MY_COOKIE_NAME, token);
}

export async function getData() {
  const { cookies } = getContext();
  const token = cookies[MY_COOKIE_NAME];
  return api.getData(token);
}
```

### Get the current authenticated session with `context.session`

If your Toolpad Studio app has [authentication](/toolpad/studio/concepts/authentication/) enabled, you can get data from the authenticated session, such as the logged-in user's `email`, `name` or `avatar`. Example:

```jsx
import { getContext } from '@toolpad/studio/server';

export async function getCurrentUserEmail() {
  const { session } = getContext();
  return session?.user.email;
}
```
