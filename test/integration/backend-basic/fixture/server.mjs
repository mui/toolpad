import { createHandler } from '@toolpad/studio';
import express from 'express';
import * as path from 'path';

const app = express();

const base = process.env.BASE;
const dir = path.resolve(process.cwd(), './toolpad');

const handler = await createHandler({
  dev: process.env.NODE_ENV === 'development',
  dir,
  base,
});
app.use(base, handler.handler);

app.listen(process.env.PORT, () => {
  console.log(`Custom server listening at http://localhost:${process.env.PORT}`);
});
