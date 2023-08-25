import { Worker, parentPort, MessageChannel, MessagePort } from 'worker_threads';
import invariant from 'invariant';
import { Methods } from '../types';

type MessageRequest = {
  kind: 'worker-rpc';
  method: string;
  args: any[];
  port: MessagePort;
};

interface MsgResponse<T = unknown> {
  error?: unknown;
  result?: T;
}

export function createWorkerRpcClient<M extends Methods>(): M {
  return new Proxy({} as M, {
    get: (target, prop) => {
      if (typeof prop !== 'string') {
        return Reflect.get(target, prop);
      }
      return (...args: any[]) => {
        return new Promise((resolve, reject) => {
          invariant(parentPort, 'Worker client is not running in a worker thread');
          const { port1, port2 } = new MessageChannel();
          port1.on('message', (msg: MsgResponse) => {
            if (msg.error) {
              reject(msg.error);
            } else {
              resolve(msg.result);
            }
          });
          parentPort.postMessage(
            {
              kind: 'worker-rpc',
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

export function createWorkerRpcServer<M extends Methods>(worker: Worker, methods: M) {
  const methodMap = new Map(Object.entries(methods));
  worker.on('message', async (msg: MessageRequest) => {
    if (msg.kind === 'worker-rpc') {
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
    }
  });
}
