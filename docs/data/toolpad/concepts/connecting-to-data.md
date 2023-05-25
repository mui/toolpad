# Queries

<p class="description">Be it a database table or an external API, Toolpad offers mechanisms to bring this serverside data to the page</p>

You can create two kinds of **queries** in Toolpad to bring data to your page.

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

  You can define extra headers to be sent along with the request in this tab. You can also bind request headers to environment variables:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-4.png", "alt": "Add request header", "caption": "Adding a request header", "indent": 1 }}

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

  ```tsx
  export async function example() {
    return {
      message: 'hello world',
    };
  }
  ```

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/query-7.gif", "alt": "Add custom function", "caption": "Adding a custom function to the query", "indent": 1 }}

<ul>
<li style="list-style-type: none">
Toolpad custom functions run fully server-side in Node.js. For example, if you change the content of the above example to:

```tsx
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

> You can import and use any Node.js module in your custom functions.

</li>
</ul>

## Parameters

To be really useful, you need to connect these queries with data present on your page. You can do so by creating **parameters.**

- ### HTTP Requests

  You can define these in the interface available in the HTTP Request query editor. You can bind a parameter to any value available on the page, and the parameter can be bound to any value in the query.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/example-parameter.png", "alt": "HTTP Request parameter", "caption": "Creating a parameter and binding it", "indent": 1 }}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/url-bound-parameter.png", "alt": "Server-side values", "caption": "Using the parameter in the query URL", "indent": 1 }}

- ### Custom Functions

  Toolpad provides a `createFunction` API to be able to define your parameters when creating custom functions:

  ```tsx
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

  This will make the `value` property available in the query editor to be bound to page state.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/connecting-to-data/custom-function-parameter.png", "alt": "Server-side values", "caption": "Using the parameter in the query URL", "indent": 1 }}

## Secrets

As these functions are running fully serverside they have access to the available environment variables through `process.env.DB_PASS`. Toolpad reads the `.env` file at the root of the project and will load its values in the environment.

An example `.env` file:

```sh
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```
