import { createHandler } from '@mui/toolpad';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send('<html><body>Go to the <a href="/my-app">Toolpad application</a></body></html>');
});

// Initialize the Toolpad handler. Make sure to pass the base path
const { handler } = await createHandler({
  dev: process.env.NODE_ENV === 'development',
  base: '/my-app',
});

// Use the handler in your application
app.use('/my-app', handler);

app.listen(3001);
