import { AsyncLocalStorage } from 'node:async_hooks';
import { IncomingMessage } from 'node:http';
import * as cookie from 'cookie';

export interface ServerContext {
  cookies: Record<string, string>;
}

const contextStore = new AsyncLocalStorage<ServerContext>();

export function getServerContext(): ServerContext | undefined {
  return contextStore.getStore();
}

export function createServerContext(req: IncomingMessage): ServerContext {
  const cookies = cookie.parse(req.headers.cookie || '');
  return {
    cookies,
  };
}

export function withContext<R = void>(ctx: ServerContext, doWork: () => Promise<R>): Promise<R> {
  return contextStore.run(ctx, doWork);
}
