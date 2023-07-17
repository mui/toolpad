import { WebSocketServer } from 'ws';
import superjson from 'superjson';
import { Methods, RpcResponse, rpcRequestSchema } from './rpc';

export default class RpcServer<M extends Methods> {
  private wss: WebSocketServer;

  private handlers = new Map<keyof M, (...params: any[]) => any>();

  constructor(wss: WebSocketServer) {
    this.wss = wss;

    this.wss.on('connection', (ws) => {
      ws.on('message', async (data) => {
        const sendError = (id: string | number | null, code: number, message: string) => {
          ws.send(
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
        const handler = this.handlers.get(method);

        if (!handler) {
          sendError(id, -32601, 'Method not found');
          return;
        }

        try {
          const result = await handler(...params);

          ws.send(
            superjson.stringify({
              jsonrpc: '2.0',
              result,
              id,
            } satisfies RpcResponse),
          );
        } catch (error) {
          sendError(id, error.code || -32000, error.message);
        }
      });
    });
  }

  register(method: keyof M, handler: M[typeof method]) {
    this.handlers.set(method, handler);
  }
}
