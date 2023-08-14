import superjson from 'superjson';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { Methods, RpcResponse, rpcRequestSchema } from './rpc';

export interface RpcServerPort {
  addEventListener(event: 'message', listener: (event: { data: string }) => void): void;
  postMessage(data: string): void;
}

export default class RpcServer<M extends Methods> {
  constructor(private port: RpcServerPort, methods: M) {
    const handlers = new Map<keyof M, (...params: any[]) => any>(Object.entries(methods));

    this.port.addEventListener('message', async ({ data }) => {
      const sendError = (id: string | number | null, code: number, message: string) => {
        this.port.postMessage(
          superjson.stringify({
            jsonrpc: '2.0',
            error: { code, message },
            id,
          } satisfies RpcResponse),
        );
      };

      const messageObject = superjson.parse(data.toString());
      const parsed = rpcRequestSchema.safeParse(messageObject);

      if (!parsed.success) {
        sendError(null, -32700, 'Invalid RPC message');
        return;
      }

      const { id, method, params } = parsed.data;
      const handler = handlers.get(method);

      if (!handler) {
        sendError(id, -32601, 'Method not found');
        return;
      }

      try {
        const result = await handler(...params);

        port.postMessage(
          superjson.stringify({
            jsonrpc: '2.0',
            result,
            id,
          } satisfies RpcResponse),
        );
      } catch (rawError) {
        const error = errorFrom(rawError);
        sendError(id, Number(error.code || -32000), error.message);
      }
    });
  }
}
