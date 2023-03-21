# Serverside HTTP requests

<p class="description">Serverside HTTP requests are the fastest way to load external data from REST APIs into a Toolpad application.</p>

## Working with serverside HTTP requests

1. Choose **Add query** in the **Inspector** on the right.

1. Select **serverside HTTP request**:

   <img src="/static/toolpad/docs/queries/query-2.png?v=0" alt="Select query type" width="464px" />

1. The query editor opens in which you can configure the HTTP request

## Basic options

   <img src="/static/toolpad/docs/fetch/query-2.png?v=0" alt="Fetch configuration" width="1439px" />

- **HTTP method** - by default GET is used, but we also support POST, PUT, DELETE, PATCH and HEAD methods.
- **url** - is an endpoint to which requests will be made. We also have an option to dynamically generate url by using [data binding](/toolpad/data-binding/). **Parameters** can be accessed by using **query** object inside url data binding editor.
- **parameters** - allows us to use [data bound](/toolpad/data-binding/) properties which can then be used to construct dynamic **url** values.

   <img src="/static/toolpad/docs/fetch/query-3.png?v=0" alt="Dynamic url" width="915px" />

## URL query

In the **URL query** tab you can configure and databind individual query parameters. The values you configure here will be appended to the querystring of the **url**.

   <img src="/static/toolpad/docs/fetch/query-5.png?v=0" alt="URL query" width="701px" />

## Body

In the **Body** tab you configure the request body. This is not available for GET requests.

   <img src="/static/toolpad/docs/fetch/query-6.png?v=0" alt="Request body" width="701px" />

There are two ways of defining the body:

- x-www-form-urlencoded: The body consists of key value pairs that are encoded in tuples separated by '&', with a '=' between the key and the value. The UI allows you to define the key value pairs. The request `content-type` will be set to `application/x-www-form-urlencoded`.
- raw: The body can be freely defined as text. The `content-type` is selectable from the dropdown.

## Request headers

In the **Headers** tab you can define extra headers to be sent along with the request.

   <img src="/static/toolpad/docs/fetch/query-7.png?v=0" alt="Request headers" width="701px" />

## Response

In the **Response** tab you can define how the response should be parsed.

   <img src="/static/toolpad/docs/fetch/query-8.png?v=0" alt="Response handling" width="701px" />

Currently there are two options available:

- JSON: This is the default behavior. Parse the response content as JSON and return the result.
- raw: Do not parse the response and return the response as text.

## Transform

Knowing that data comes in a different shapes and forms we provide a way to **transform response**:

   <img src="/static/toolpad/docs/fetch/query-9.png?v=0" alt="Response transformation" width="701px" />

- Enable the transformation by checking **Transform response**.
- Write a JavaScript expression that transforms and returns a `data` variable which exists in global scope. The `data` variable contains the content of the response so far.

## Finishing

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. Once finished with configuration click **Save** to commit your changes and return to the canvas.
