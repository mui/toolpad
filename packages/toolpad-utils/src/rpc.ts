import { MessagePort, MessageChannel } from 'worker_threads';
import { Awaitable } from './types';

export type Methods = Record<string, (...args: unknown[]) => Awaitable<unknown>>;

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
      } catch (error) {
        msg.port.postMessage({ error } satisfies MsgResponse);
      }
    } else {
      msg.port.postMessage({
        error: new Error(`Method "${msg.method}" not found`),
      } satisfies MsgResponse);
    }
  });
  port.start();
}
