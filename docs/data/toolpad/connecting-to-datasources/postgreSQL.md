# PostgreSQL

<p class="description">PostgreSQL datasource allows us to fetch data straight from PostgreSQL database.</p>

## Working with PostgreSQL

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section before you can use **PostgreSQL** query you will first need to setup **connection**:

1. Once your **connection** is ready click on **ADD QUERY** in the **Inspector** on the right.

1. Select **PostgreSQL** datasource and click **CREATE QUERY**:

   ![Postgres type](/static/toolpad/postgres-query-1.png)

1. We got all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition we can configure following properties inline:

   ![Postgres configuration](/static/toolpad/postgres-query-2.png)

   - On the left side we have a textarea where we can pass **SQL** query.

   - On the right is a table for previewing results.

   - Below the query editor we can configure **Parameters** which can be used to bind data for our SQL queries. We can use the standard PostgreSQL `$1`, `$2`, `$3` interpolation.

   ![Parameters configuration](/static/toolpad/postgres-query-3.png)

   Like so: `SELECT * FROM "db" WHERE name = $name`.

1. Once finished with configuration click **SAVE** to commit your changes and return to the canvas.
