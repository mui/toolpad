import { WebSocketServer } from 'ws';
import superjson from 'superjson';
import { rpcMessageSchema, RpcServerDefinition } from './rpc';

export default class RpcServer<S extends RpcServerDefinition> {
  private wss: WebSocketServer;

  private handlers = new Map<keyof S['methods'], (...params: any[]) => any>();

  constructor(wss: WebSocketServer) {
    this.wss = wss;

    this.wss.on('connection', (ws) => {
      ws.on('message', async (data) => {
        const rpcMessage = rpcMessageSchema.parse(superjson.parse(data.toString()));

        if (rpcMessage.request) {
          const { id, method, params } = rpcMessage.request;
          const handler = this.handlers.get(method);

          const sendError = (code: number, message: string) => {
            ws.send(
              superjson.stringify({
                jsonrpc: '2.0',
                error: { code, message },
                id,
              }),
            );
          };

          if (!handler) {
            sendError(-32601, 'Method not found');
            return;
          }

          try {
            const result = await handler(params);

            ws.send(
              superjson.stringify({
                jsonrpc: '2.0',
                result,
                id,
              }),
            );
          } catch (error) {
            sendError(error.code || -32000, error.message);
          }
        }
      });
    });
  }

  register(method: keyof S['methods'], handler: S['methods'][typeof method]) {
    this.handlers.set(method, handler);
  }
}
