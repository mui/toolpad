import * as http from 'http';
import getPort from 'get-port';

/**
 * A convenience wrapper around node.js createServer + listen for testing purposes.
 * - starts a http server using `handler` on a free port
 * - returns the port and stopServer method for cleanup.
 */
export async function startServer(handler?: http.RequestListener) {
  const server = http.createServer(handler);
  const port = await getPort();
  let app: http.Server | undefined;
  await new Promise((resolve, reject) => {
    app = server.listen(port);
    app.once('listening', resolve);
    app.once('error', reject);
  });
  return {
    port,
    async stopServer() {
      await new Promise<void>((resolve, reject) => {
        if (app) {
          app.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    },
  };
}
