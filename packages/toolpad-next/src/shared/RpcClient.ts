import * as superjson from 'superjson';
import { Methods, RequestId, RpcRequest, rpcResponseSchema } from './rpc';

export interface RpcClientPort {
  addEventListener(event: 'message', listener: (event: { data: string }) => void): void;
  postMessage(data: string): void;
}

export default class RpcClient<M extends Methods> {
  private nextId = 0;

  private pendingRequests = new Map<
    RequestId,
    { timeout: NodeJS.Timeout; resolve: (result: any) => void; reject: (error: Error) => void }
  >();

  constructor(private port: RpcClientPort) {
    this.port.addEventListener('message', (event) => {
      const message = rpcResponseSchema.parse(superjson.parse(event.data));

      const { id, result, error } = message;

      const pending = this.pendingRequests.get(id);

      if (!pending) {
        // Timed out
        return;
      }

      clearTimeout(pending.timeout);
      this.pendingRequests.delete(id);

      if (error) {
        pending.reject(
          Object.assign(
            new Error(`${error.code ? `${error.code}: ` : ''}${error.message || 'Unknown error'}`, {
              cause: error,
            }),
            {
              code: error.code,
            },
          ),
        );
      } else {
        pending.resolve(result);
      }
    });
  }

  async call(
    method: keyof M & string,
    params: Parameters<M[typeof method]>,
  ): Promise<Awaited<ReturnType<M[typeof method]>>> {
    return new Promise<any>((resolve, reject) => {
      const id = this.nextId;
      this.nextId += 1;

      const message = superjson.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id,
      } satisfies RpcRequest);

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timed out after 30 seconds`));
      }, 30000);

      this.pendingRequests.set(id, { timeout, resolve, reject });

      this.port.postMessage(message);
    });
  }
}
