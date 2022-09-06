# Fetch

<p class="description">Fetch datasource is the easiest and fastest way to load external data within Toolpad app.</p>

## Working with fetch

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section you can either create a reusable `connection` or simply create a new `query` and put all connection details inline

1. Choose `ADD QUERY` in the `Properties editor` on the right

1. Select `Fetch` datasource and click `CREATE QUERY`

   ![Fetch datasource](/static/toolpad/fetch-query-1.png)

1. We got all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section

1. In addition we can configuration following properties inline

   ![Fetch configuration](/static/toolpad/fetch-query-2.png)

   - `parameters` - allows us to use [data bound](/toolpad/data-binding/) properties which can then be used construct dynamic `url` value
   - `HTTP method` - by default `GET` is used, but we also support `POST`, `PUT`, `DELETE`, `PATHC` and `HEAD` methods
   - `url` - is an endpoint to which requests will be made. We also have an option to dynamically generate `url` by using [data binding](/toolpad/data-binding/). `Parameters` can be accessed by using `query` object inside `url` `data binding` editor

   ![Dynamic url](/static/toolpad/fetch-query-3.png)

1. Knowing that data comes in a different shapes we provide an easy way to `transform response`

   - Simply enable option by checking `Transform response`
   - Then modify which properties of `data` object should be returned as a final response

   ![Transform response](/static/toolpad/fetch-query-4.png)

1. Once finished with configuration click `SAVE` and click anywhere outside of the dialog to return to the editor
