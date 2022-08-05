import * as http from 'http';
import getPort from 'get-port';

export async function startServer(handler?: http.RequestListener) {
  const server = http.createServer(handler);
  const port = await getPort({ port: 3000 });
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
