import { createHandler } from '@toolpad/studio';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <body>  
        👋 This is a <a href="https://mui.com/toolpad/concepts/custom-server/">custom server</a>,
        it hosts to a <a href="/my-app">Toolpad Studio application</a>.
      </body>
    </html>
  `);
});

// Initialize the Toolpad handler. Make sure to pass the base path
const { handler } = await createHandler({
  dev: process.env.NODE_ENV === 'development',
  base: '/my-app',
});

// Use the handler in your application
app.use('/my-app', handler);

const server = app.listen(3001, () => {
  console.log(`Listening on http://localhost:${server.address().port}`);
});
