# HTTP requests

<p class="description">These offer a fast way to load external data from REST APIs, via a configurable interface.</p>

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-1.png", "alt": "Add HTTP request", "caption": "Adding a query via the HTTP Request panel" }}

## HTTP Request editor

The following options are configurable here:

- ### URL query

  You can add query parameters to your request here. These get appended to the request URL, like
  `https://dog.ceo/api/breed/akita/images/random?param1=value1`

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-2.png", "alt": "Add query params", "caption": "Adding a query parameter", "indent": 1, "aspectRatio": 6 }}

- ### Body

  You can configure the request body in this tab. This may be of the following types:

  - `x-www-form-urlencoded`: The body consists of key value pairs that are encoded in tuples separated by `&`, with a `=` between the key and the value. The UI allows you to define the key value pairs. The request `content-type` will be set to `application/x-www-form-urlencoded`.

  - `raw`: The body can be freely defined as text. The `content-type` is selectable from the dropdown.

  > `GET` requests do not have a request body

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-3.png", "alt": "Add request body", "caption": "Adding a request body", "indent": 1, "aspectRatio": 6 }}

- ### Request headers

  You can define extra headers to be sent along with the request in this tab.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-4.png", "alt": "Add request header", "caption": "Adding a request header", "indent": 1, "aspectRatio": 6 }}

- ### Response

  You can define how the response should be parsed in this tab.

  There are two options available:

  - `JSON`: This is the default behavior. Parse the response content as JSON and return the result.

  - `raw`: Do not parse the response and return the response as text.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-5.png", "alt": "Add response parse format", "caption": "Adding a response parse format", "indent": 1, "aspectRatio": 6 }}

- ### Transform

  You can transform the response via a JavaScript expression in this tab. This expression must return a `data` variable.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/query-6.png", "alt": "Add transformation", "caption": "Transforming the response via JavaScript", "indent": 1, "aspectRatio": 6 }}

## Parameters

To be really useful, you need to connect these queries with data present on your page. You can do so by creating **parameters.**

You can define these in the interface available in the HTTP Request query editor. You can bind a parameter to any value available on the page, and the parameter can be bound to any value in the query.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/example-parameter.png", "alt": "HTTP Request parameter", "caption": "Creating a parameter and binding it", "indent": 1, "aspectRatio": 6 }}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/bound-parameter.png", "alt": "Server-side values", "caption": "Using the parameter in the query URL", "indent": 1, "aspectRatio": 6 }}

### Secrets

As Toolpad Studio HTTP requests are running server-side, they can make use of the available secrets that are stored in environment variables. The mechanism works similar by defining a parameter and instead of binding it to a UI value, bind it to an environment variable. Whenever the request executes, Toolpad Studio will feed the value of the environment variable to the parameter.

<video controls width="auto" height="100%" style="contain" alt="custom-function">
  <source src="/static/toolpad/docs/studio/concepts/connecting-to-data/secrets.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

The parameter can then be used anywhere inside of the HTTP request definition the same way as regular UI bound parameters.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/connecting-to-data/bound-secret.png", "alt": "Server-side values", "caption": "Using the parameter in the query URL", "indent": 1 }}
