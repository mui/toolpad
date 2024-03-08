# Connecting to databases

<p class="description">Toolpad Studio allows you to connect to any database, fast.</p>

We can write a custom function to connect to any database that we need to.
We can focus on writing database queries, while the data fetching and displaying is handled by Toolpad Studio.

## Connecting to MySQL

### Custom function

Inside `/resources/functions.ts`, we can create a custom function:

```ts
import mysql from 'mysql2/promise';

async function createConnection() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    namedPlaceholders: true,
  });
  return connection;
}

export async function getData(order_id: number) {
  const connection = await createConnection();
  const query = `SELECT * FROM table WHERE order_id = :emailPattern`;
  const [rows] = await connection.execute(query, {
    emailPattern: order_id,
  });
  await connection.end();
  return rows;
}
```

If our queries don't rely on parameters, we may even use a `.sql` file stored in the file system so that we can keep them organised:

```ts
import * as fs from 'fs/promises';

export async function getData() {
  const query = await fs.readFile('./toolpad/resources/getData.sql', {
    encoding: 'utf8',
  });
  const connection = await createConnection();
  const [rows] = await connection.execute(query);
  await connection.end();
  return rows;
}
```

Keep in mind that we can run any SQL query on our database through these custom functions.

### Using SSH tunnels (optional)

Instead of connecting directly, we may want to create an SSH tunnel to connect to our database. We can modify our function a bit to make this happen:

```ts
import mysql from 'mysql2/promise';
import SSH2Promise from 'ssh2-promise';

async function createConnection() {
  const ssh = new SSH2Promise({
    host: process.env.BASTION_HOST,
    port: 22, // default port for the SSH protocol
    username: process.env.BASTION_USERNAME,
    privateKey: process.env.BASTION_SSH_KEY.replace(/\\n/g, '\n'),
  });

  const tunnel = await ssh.addTunnel({
    remoteAddr: process.env.MYSQL_HOST,
    remotePort: process.env.MYSQL_PORT,
  });

  const connection = await mysql.createConnection({
    host: 'localhost',
    port: tunnel.localPort,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    namedPlaceholders: true,
  });

  return connection;
}
```

which you should close at the end with:

```ts
await ssh.close();
```
