import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import invariant from 'invariant';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();

  const server = createServer(async (req, res) => {
    invariant(req.url, 'missing request url');

    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', (err) => {
      reject(err);
    });
    server.listen(port, () => {
      resolve();
    });
  });

  // eslint-disable-next-line no-console
  console.log(`> Ready on http://${hostname}:${port}`);
})();
