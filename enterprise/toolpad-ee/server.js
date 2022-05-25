const { createServer, STATUS_CODES } = require('http');
const { parse } = require('url');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const toolpadCeDir = path.dirname(require.resolve('@mui/toolpad-app/package.json'));
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, dir: toolpadCeDir });
const handle = app.getRequestHandler();

function sendStatus(res, statusCode) {
  res.statusCode = statusCode;
  res.write(STATUS_CODES[statusCode]);
  res.end();
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      if (req.url === '/health-check') {
        sendStatus(res, 200);
        return;
      }

      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      sendStatus(res, 500);
    }
  }).listen(port, hostname, (err) => {
    if (err) {
      throw err;
    }
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
