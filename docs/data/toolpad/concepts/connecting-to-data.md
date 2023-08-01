# Queries

<p class="description">Be it a database table or an external API, Toolpad offers mechanisms to bring this serverside data to the page</p>

You can create two kinds of **queries** in Toolpad to bring data to your page.

:::info
Toolpad uses `react-query` internally to run queries. Look into [its documentation](https://tanstack.com/query/latest/docs/react/guides/queries) for more details on query objects.
:::

## HTTP Requests

These offer a fast way to load external data from REST APIs, via a configurable interface.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-1.png", "alt": "Add HTTP request", "caption": "Adding a query via the HTTP Request editor" }}

The following options are configurable here:

- ### URL query

  You can add query parameters to your request here. These get appended to the request URL, like
  `https://dog.ceo/api/breed/akita/images/random?param1=value1`

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-2.png", "alt": "Add query params", "caption": "Adding a query parameter", "indent": 1 }}

- ### Body

  You can configure the request body in this tab. This may be of the following types:

  - `x-www-form-urlencoded`: The body consists of key value pairs that are encoded in tuples separated by `&`, with a `=` between the key and the value. The UI allows you to define the key value pairs. The request `content-type` will be set to `application/x-www-form-urlencoded`.

  - `raw`: The body can be freely defined as text. The `content-type` is selectable from the dropdown.

  > `GET` requests do not have a request body

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-3.png", "alt": "Add request body", "caption": "Adding a request body", "indent": 1 }}

- ### Request headers

  You can define extra headers to be sent along with the request in this tab.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/http-query-headers.png", "alt": "Add request header", "caption": "Adding a request header", "indent": 1 }}

- ### Response

  You can define how the response should be parsed in this tab.

  There are two options available:

  - `JSON`: This is the default behavior. Parse the response content as JSON and return the result.

  - `raw`: Do not parse the response and return the response as text.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-5.png", "alt": "Add response parse format", "caption": "Adding a response parse format", "indent": 1 }}

- ### Transform

  You can transform the response via a JavaScript expression in this tab. This expression must return a `data` variable.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-6.png", "alt": "Add transformation", "caption": "Transforming the response via JavaScript", "indent": 1 }}

## Custom Functions

The most powerful way of bringing data into Toolpad is through using your own code. You can define functions inside `toolpad/resources` and use them when creating a query of this type.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/custom-function.png", "alt": "Add custom function", "caption": "Adding a custom function query" }}

You can configure the following options here:

- ### Function

  This corresponds to a function that you create on your file system, inside the `toolpad/resources` folder. For example, in `toolpad/resources/functions.ts`

  ```jsx
  export async function example() {
    return {
      message: 'hello world',
    };
  }
  ```

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/custom-function-example.gif", "alt": "Select custom function in the query", "caption": "Adding a custom function to the query", "indent": 1 }}

<ul>
<li style="list-style-type: none">
Toolpad custom functions run fully server-side in Node. For example, if you change the content of the above example to:

```jsx
export async function example() {
  return {
    message: process.versions,
  };
}
```

You get the following response:

</li>
</ul>

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-8.png", "alt": "Server-side values", "caption": "Using server-side values in custom functions", "indent": 1 }}

<ul>

<li style="list-style-type: none">

> You can import and use any Node module in your custom functions.

</li>
</ul>

## Parameters

To be really useful, you need to connect these queries with data present on your page. You can do so by creating **parameters.**

- ### HTTP Requests

  You can define these in the interface available in the HTTP Request query editor. You can bind a parameter to any value available on the page, and the parameter can be bound to any value in the query.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/example-parameter.png", "alt": "HTTP Request parameter", "caption": "Creating a parameter and binding it", "indent": 1 }}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/url-bound-parameter.png", "alt": "Server-side values", "caption": "Using the parameter in the query URL", "indent": 1 }}

- ### Custom Functions

  All function arguments will be available in the query editor to bind state to. Make sure to annotate them correctly with their typescript types. Toolpad uses this information to present you with correctly typed databinding controls. For example:

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

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/custom-function-params.png", "alt": "Controls for custom function parameters", "caption": "Controls for custom function parameters", "indent": 1, "zoom": false, "width": 639}}

:::info
Toolpad also provides a `createFunction` API to be able to define your parameters when creating custom functions:

```jsx
import { createFunction } from '@mui/toolpad/server';

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

This API is now deprecated, and will be removed from a future version of Toolpad. Find more details in the `createFunction` [reference](/toolpad/reference/api/create-function/) section.
:::

## Mode

You can set the **mode** of the query to either be automatically refetched on page load, or only be called on manual action.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/mode-query.gif", "alt": "Query mode", "caption": "Setting the query mode", "indent": 1, "aspectRatio": 6}}

- ### Automatic

  You can configure the following settings in this mode:

  - **Enabled**

    You can use this option to enable or disable the query from running

  - **Refetch interval**

    You can configure the query to run on an interval, for example every 30s.
    To disable this option, keep the field empty.

  Queries set to the automatic mode may be re-fetched via the `refetch` function available on these query objects. For example, for a query named `getOrders`, we can add

  ```js
  getOrders.refetch();
  ```

  in the `onClick` binding of a Button component.

- ### Manual

  Queries set to this mode can be called via a JavaScript expression in a binding. For example, for a query named `createCustomer`, we can add

  ```js
  createCustomer.call();
  ```

  in the `onClick` binding of a Button component. This will trigger this query when the Button is clicked.

:::info
See the [event handling](/toolpad/concepts/managing-state/#event-handling) section for more details, and the [deleting data grid row](/toolpad/how-to-guides/delete-datagrid-row/) guide for a detailed usage example.
:::

## Secrets

Toolpad has access to the environment variables defined in the `.env` file at the root of the project.

- ### HTTP Requests

  You can connect to environment variables inside HTTP request queries. For example, you can define an `Authorization` header and bind it to a value from your environment variables:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/secrets-http-query.png", "alt": "Secret in HTTP request query", "caption": "Using an environment variable in the request header", "indent": 1 }}

- ### Custom Functions

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

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/ask-gpt.gif", "alt": "Custom function with secret", "caption": "Using a custom function with environment variables", "indent": 1 }}
