# Connecting to databases

<p class="description">Toolpad allows you to connect to any database, fast. </p>

We can write a custom function to connect to any database that we need to. We can focus on writing database queries, while the data fetching and displaying is handled by Toolpad.

## Connecting to MySQL

### Custom function

Inside `/resources/functions.ts`, we can create a custom function using Toolpad's `createFunction` API:

```ts
import { createFunction } from '@mui/toolpad/server';
import mysql from 'mysql2/promise';
import fs from 'fs';

async connectionFn () {
   const connection = await mysql.createConnection({
   host: process.env.MYSQL_HOST,
   port: process.env.MYSQL_PORT,
   user: process.env.MYSQL_USERNAME,
   password: process.env.MYSQL_PASSWORD,
   database: process.env.MYSQL_DATABASE
   });
   return connection;
}

export const getData = createFunction(async function getData() {
   const query = `SELECT * FROM table WHERE order_id=${parameters.order_id}`;
   const connection = await connectionFn();
   const [rows] = await connection.execute(sql);
   connection.end();
   return rows;
}, {
   parameters: {
      order_id: {
         type: 'number'
      }
   }
});

```

If our queries don't rely on parameters, we may even use a `.sql` file stored in the file system so that we can keep them organised:

```ts
export const getData = createFunction(async function getData() {
  const query = fs.readFileSync('./toolpad/resources/getData.sql');
  const connection = await connectionFn();
  const [rows] = await connection.execute(sql);
  connection.end();
  return rows;
});
```

Keep in mind that we can run any SQL query on our database through these custom functions.

### Using SSH tunnels (Optional)

Instead of connecting directly, we may want to create an SSH tunnel to connect to our database. We can modify our function a bit to make this happen:

```ts
import { createFunction } from '@mui/toolpad/server';
import mysql from 'mysql2/promise';
import SSH2Promise from 'ssh2-promise';
import fs from 'fs';

async function connectionFn() {

const ssh = new SSH2Promise({
  host: process.env.BASTION_HOST,
  port: 22,
  username: process.env.BASTION_USERNAME,
  privateKey: process.env.BASTION_SSH_KEY.replace(/\\n/g, '\n'),
});

const tunnel = await ssh.addTunnel({
  remoteAddr: process.env.STORE_HOST,
  remotePort: 3306,
});

const connection = await mysql.createConnection({
    host: 'localhost',
    port: tunnel.localPort,
    user: process.env.STORE_USERNAME,
    password: process.env.STORE_PASSWORD,
    database: process.env.STORE_DATABASE,
    multipleStatements: multiple,
  });

  return connection;

```
