import * as http from 'http';
import invariant from 'invariant';

/**
 * A Promise wrapper for server.listen
 */
export async function listen(handler: http.RequestListener | http.Server, port?: number) {
  const server = typeof handler === 'function' ? http.createServer(handler) : handler;
  let app: http.Server | undefined;
  await new Promise((resolve, reject) => {
    app = server.listen(port);
    app.once('listening', resolve);
    app.once('error', reject);
  });

  const address = app?.address();
  invariant(address && typeof address === 'object', 'expected address to be an AddressInfo object');

  return {
    port: address.port,
    async close() {
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
