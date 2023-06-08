import { Worker, MessageChannel, MessagePort, isMainThread, parentPort } from 'worker_threads';
import { once } from 'node:events';
import invariant from 'invariant';

interface WorkerRequest<T> {
  port: MessagePort;
  method: keyof T;
  args: any[];
}

interface WorkerResponse {
  result?: any;
  error?: any;
}

type Methods = { [method: string]: (...args: any[]) => Promise<any> };

let isInitialized = false;
export function serveWorkerApi<T extends Methods>(handlers: T) {
  invariant(!isMainThread, 'serveWorkerApi() must be called from a worker thread');

  invariant(!isInitialized, 'serveWorkerApi() must be called only once');
  isInitialized = true;

  parentPort!.on('message', async ({ port, method, args }: WorkerRequest<T>) => {
    try {
      const result = await handlers[method](...args);
      port.postMessage({ result } satisfies WorkerResponse);
    } catch (error) {
      port.postMessage({ error } satisfies WorkerResponse);
    }
  });
}

export function createWorkerApi<T extends Methods>(worker: Worker): T {
  invariant(isMainThread, 'createWorkerApi() must be called from a the main thread');

  return new Proxy({} as T, {
    get(_, prop) {
      return async (...args: any[]) => {
        const { port1, port2 } = new MessageChannel();
        worker.postMessage(
          {
            port: port1,
            method: prop as keyof T,
            args,
          } satisfies WorkerRequest<T>,
          [port1],
        );
        const [res] = (await once(port2, 'message')) as [WorkerResponse];
        if (res.error) {
          throw res.error;
        }
        return res.result;
      };
    },
  });
}
