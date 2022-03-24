const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const basicAuth = require('basic-auth');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const BASIC_AUTH_USER = process.env.STUDIO_BASIC_AUTH_USER;
const BASIC_AUTH_PASSWORD = process.env.STUDIO_BASIC_AUTH_PASSWORD;

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      if (BASIC_AUTH_USER) {
        if (!BASIC_AUTH_PASSWORD) {
          throw new Error(
            `Basic Auth user configured without password. Please provide the STUDIO_BASIC_AUTH_PASSWORD environment variable.`,
          );
        }

        const user = basicAuth(req);

        if (user && !(user.name === BASIC_AUTH_USER && user.pass === BASIC_AUTH_PASSWORD)) {
          res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
          res.statusCode = 401;
          res.end();
          return;
        }
      }

      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
