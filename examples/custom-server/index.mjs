import { unstable_createHandler as createHandler } from '@mui/toolpad';
import express from 'express';

const app = express();

const appBase = '/my-app';
const handler = await createHandler({
  dev: process.env.NODE_ENV === 'development',
  base: appBase,
});
app.use('/my-app', handler.handler);

app.listen(3001);
