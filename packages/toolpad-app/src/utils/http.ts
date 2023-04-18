import * as http from 'http';

/**
 * async version of http.Server listen(port) method
 */
export async function listen(server: http.Server, port?: number) {
  await new Promise<void>((resolve, reject) => {
    const handleError = (err: Error) => {
      reject(err);
    };
    server.once('error', handleError).listen(port, () => {
      server.off('error', handleError);
      resolve();
    });
  });
}
