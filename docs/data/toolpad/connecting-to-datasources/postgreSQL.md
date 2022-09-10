# PostgreSQL datasource

<p class="description">PostgreSQL datasource allows fetching data straight from PostgreSQL database.</p>

## Working with PostgreSQL

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section you can either create a reusable connection or simply create a new query and put all connection details inline:

1. Once your connection is ready click on **ADD QUERY** in the **Inspector** on the right.

1. Select PostgreSQL datasource and click **CREATE QUERY**:

   <img src="/static/toolpad/postgres-query-1.png" alt="Postgres type" width="593px" style="margin-bottom: 16px;" />

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition you can configure following properties inline:

   <img src="/static/toolpad/postgres-query-2.png" alt="Postgres configuration" width="1120px" />

   - On the left is a SQL query editor.

   - On the right is a table for previewing results.

   - Below the query editor you can configure parameters which can be used to bind page state to your SQL query. Toolpad uses [prepared statements](https://www.postgresql.org/docs/current/sql-prepare.html) under the hood to prevent SQL injection. You can use the positional parameter syntax (`$1`, `$2`, `$3`) of postgres prepared statements. Additionally it will also accept named parameters of the form `$myParameter`.

      <img src="/static/toolpad/postgres-query-3.png" alt="Parameters configuration" width="553px" />

     Like so: `SELECT * FROM "db" WHERE name = $name`.

1. Once finished with configuration click **SAVE** to commit your changes and return to the canvas.
