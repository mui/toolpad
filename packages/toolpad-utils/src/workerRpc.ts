import { MessagePort, MessageChannel } from 'worker_threads';
import { Awaitable } from './types';
import { errorFrom, serializeError } from './errors';

/**
 * Helpers that are intended to set up rpc between a Node.js worker thread and the main thread.
 * Create the worker and pass a port in the workerData.
 *
 * On the main thread:
 *
 *     const rpcChannel = new MessageChannel()
 *     const worker = new Worker('./myWorker.js', {
 *       workerData: { rpcPort: rpcChannel.port1 },
 *       transferList: [rpcChannel.port1]
 *     })
 *
 *     // Depending of the direction of communication, either
 *     const client = createRpcClient(rpcChannel.port2)
 *     // or
 *     serveRpc(rpcChannel.port2, {
 *       myMethod
 *     })
 *
 * On the worker thread:
 *
 *     // Depending of the direction of communication, either
 *     const client = createRpcClient(workerData.rpcPort)
 *     // or
 *     serveRpc(workerData.rpcPort, {
 *       myMethod
 *     })
 *
 * Use multiple channels for bidirectional communication.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Methods = Record<string, (...args: any[]) => Awaitable<any>>;

type MessageRequest = {
  method: string;
  args: unknown[];
  port: MessagePort;
};

interface MsgResponse<T = unknown> {
  error?: unknown;
  result?: T;
}

interface CreateRpcClientOptions {
  timeout?: number;
}

export function createRpcClient<M extends Methods>(
  port: MessagePort,
  { timeout = 30000 }: CreateRpcClientOptions = {},
): M {
  return new Proxy({} as M, {
    get: (target, prop) => {
      if (typeof prop !== 'string') {
        return Reflect.get(target, prop);
      }
      return (...args: unknown[]) => {
        return new Promise((resolve, reject) => {
          const { port1, port2 } = new MessageChannel();

          const timeoutId = setTimeout(() => {
            port1.close();
          }, timeout);

          port1.on('message', (msg: MsgResponse) => {
            clearTimeout(timeoutId);
            if (msg.error) {
              reject(msg.error);
            } else {
              resolve(msg.result);
            }
          });

          port1.start();

          port.postMessage(
            {
              method: prop,
              args,
              port: port2,
            } satisfies MessageRequest,
            [port2],
          );
        });
      };
    },
  });
}

export function serveRpc<M extends Methods>(port: MessagePort, methods: M) {
  const methodMap = new Map(Object.entries(methods));
  port.on('message', async (msg: MessageRequest) => {
    const method = methodMap.get(msg.method);
    if (method) {
      try {
        const result = await method(...msg.args);
        msg.port.postMessage({ result } satisfies MsgResponse);
      } catch (rawError) {
        msg.port.postMessage({ error: serializeError(errorFrom(rawError)) } satisfies MsgResponse);
      }
    } else {
      msg.port.postMessage({
        error: new Error(`Method "${msg.method}" not found`),
      } satisfies MsgResponse);
    }
  });
  port.start();
}
