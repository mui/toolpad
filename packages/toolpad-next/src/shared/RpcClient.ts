import * as superjson from 'superjson';
import { RequestId, RpcRequest, RpcServerDefinition, rpcMessageSchema } from './rpc';

export default class RpcClient<S extends RpcServerDefinition> {
  private nextId = 0;

  private ws: WebSocket;

  private pendingRequests = new Map<
    RequestId,
    { timeout: NodeJS.Timeout; resolve: (result: any) => void; reject: (error: Error) => void }
  >();

  constructor(ws: WebSocket) {
    this.ws = ws;

    this.ws.addEventListener('message', (event) => {
      const message = rpcMessageSchema.parse(superjson.parse(event.data));

      if (message.response) {
        const { id, result, error } = message.response;

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
              new Error(
                `${error.code ? `${error.code}: ` : ''}${error.message || 'Unknown error'}`,
                {
                  cause: error,
                },
              ),
              {
                code: error.code,
              },
            ),
          );
        } else {
          pending.resolve(result);
        }
      }
    });
  }

  async call(
    method: keyof S['methods'] & string,
    params: Parameters<S['methods'][typeof method]>,
  ): Promise<Awaited<ReturnType<S['methods'][typeof method]>>> {
    return new Promise<any>((resolve, reject) => {
      const id = this.nextId;
      this.nextId += 1;

      const message = superjson.stringify({
        jsonrpc: '2.0',
        method,
        params: [superjson.stringify(params)],
        id,
      } satisfies RpcRequest);

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timed out after 30 seconds`));
      }, 30000);

      this.pendingRequests.set(id, { timeout, resolve, reject });

      this.ws.send(message);
    });
  }
}
