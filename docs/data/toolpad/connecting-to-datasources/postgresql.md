# PostgreSQL datasource

<p class="description">PostgreSQL datasource allows fetching data straight from PostgreSQL database.</p>

## Working with PostgreSQL

1. Create a new PostgreSQL connection as explained in the [instructions](/toolpad/connecting-to-datasources/connections/#postgresql).

1. Once your connection is ready click on **ADD QUERY** in the **Inspector** on the right.

1. Select PostgreSQL datasource and click **CREATE QUERY**:

   <img src="/static/toolpad/docs/postgres/postgres-1.png" alt="Postgres type" width="590px" style="margin-bottom: 16px;" />

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition you can configure following properties inline:

   <img src="/static/toolpad/docs/postgres/postgres-2.png" alt="Postgres configuration" width="1438" />

   - On the left is a SQL query editor.

   - On the right is a table for previewing results.

   - Below the query editor you can configure parameters which can be used to bind page state to your SQL query. Toolpad uses [prepared statements](https://www.postgresql.org/docs/current/sql-prepare.html) under the hood to prevent SQL injection. You can use the positional parameter syntax (`$1`, `$2`, `$3`) of postgres prepared statements. Additionally it will also accept named parameters of the form `$myParameter`.

      <img src="/static/toolpad/docs/postgres/postgres-3.png" alt="Parameters configuration" width="709" />

     Like so: `SELECT * FROM "db" WHERE name = $name`.

1. Once finished with configuration click **SAVE** to commit your changes and return to the canvas.
