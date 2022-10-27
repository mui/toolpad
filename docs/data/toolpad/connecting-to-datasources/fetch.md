# Fetch datasource

<p class="description">Fetch datasource is the easiest and fastest way to load external data within Toolpad app.</p>

## Working with fetch

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section you can either create a reusable connection or simply create a new query and put all connection details inline:

1. Choose **ADD QUERY** in the **Inspector** on the right.

1. Select fetch datasource and click **CREATE QUERY**:

   <img src="/static/toolpad/docs/fetch-query-1.png" alt="Fetch datasource" width="587px" />

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition you can configuration following properties inline:

   <img src="/static/toolpad/docs/fetch-query-2.png" alt="Fetch configuration" width="1439px" />
   <br />

   - **HTTP method** - by default GET is used, but we also support POST, PUT, DELETE, PATCH and HEAD methods.
   - **url** - is an endpoint to which requests will be made. We also have an option to dynamically generate url by using [data binding](/toolpad/data-binding/). **Parameters** can be accessed by using **query** object inside url data binding editor.
   - **parameters** - allows us to use [data bound](/toolpad/data-binding/) properties which can then be used construct dynamic **url** value.

   <img src="/static/toolpad/docs/fetch-query-3.png" alt="Dynamic url" width="915px" />

1. Knowing that data comes in a different shapes we provide an easy way to **transform response**:

   - Simply enable option by checking **Transform response**.
   - Then modify which properties of data object should be returned as a final response.

   <img src="/static/toolpad/docs/fetch-query-4.png" alt="Transform response" width="701px" />

1. Once finished with configuration click **SAVE** to commit your changes and return to the canvas.
