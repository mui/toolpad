import { AsyncLocalStorage } from 'node:async_hooks';
import { IncomingMessage, ServerResponse } from 'node:http';
import * as cookie from 'cookie';

export interface ServerContext {
  cookies: Record<string, string>;
  setCookie: (name: string, value: string) => void;
}

const contextStore = new AsyncLocalStorage<ServerContext>();

export function getServerContext(): ServerContext | undefined {
  return contextStore.getStore();
}

export function createServerContext(req: IncomingMessage, res: ServerResponse): ServerContext {
  const cookies = cookie.parse(req.headers.cookie || '');
  return {
    cookies,
    setCookie(name, value) {
      res.setHeader('Set-Cookie', cookie.serialize(name, value));
    },
  };
}

export function withContext<R = void>(ctx: ServerContext, doWork: () => Promise<R>): Promise<R> {
  return contextStore.run(ctx, doWork);
}
