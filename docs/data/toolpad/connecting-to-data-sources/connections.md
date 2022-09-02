# Connections

<p class="description">
    <b>CONNECTION</b> instance allows us to reuse certain configuration details to create <b>queries</b> faster
</p>

In order to create a new `CONNECTION` instance press `+` button in the `Instance editor` on the left

![Add Connection](/static/toolpad/connection.png)

## Connection types

There are 2 query types that **do not require** `CONNECTION` instance:

1. [Function](/toolpad/connecting-to-data-sources/function/) type

   ![Connection function](/static/toolpad/connection-function-1.png)

   We can define `Secrets` (key/value) that we can later access in the `Function` type `query`

   ![Connection function](/static/toolpad/connection-function-2.png)

1. [Fetch](/toolpad/connecting-to-data-sources/fetch/) type

   ![Connection fetch](/static/toolpad/connection-fetch-1.png)

   We can configure:

   - `base url` - url that can be shared between different types of queries
   - `Headers` - pass custom headers with each request
   - `Authentication` type - if your API is protected choose authentication method that fits your needs:
     - `Basic` - adds `Authorization` header and generates **base64** encoded value for a given user credentials
     - `Bearer token` - adds `Authorization` header generates value for provided token
     - `API key` - adds key/value header

There are 2 types that **require** `CONNECTION` instance:

1. [Google Sheets](/toolpad/connecting-to-data-sources/google-sheets/) type

   TODO

1. [Postgres](/toolpad/connecting-to-data-sources/postgres/) type

   In order `query` data from `postgres` database we **must** configure connection

   ![Connection postgres](/static/toolpad/connection-postgres-1.png)

   Provide database credentials and `TEST CONNECTION` to verify that we are able to connect

   If everything is correct `SAVE` and you will be able to use [Postgres](/toolpad/connecting-to-data-sources/postgres/) queries
