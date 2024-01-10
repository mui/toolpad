import { AsyncLocalStorage } from 'node:async_hooks';
import { IncomingMessage, ServerResponse } from 'node:http';
import * as cookie from 'cookie';
import { isWebContainer } from '@webcontainer/env';

export interface ServerContext {
  /**
   * A dictionary mapping cookie name to cookie value.
   */
  cookies: Record<string, string>;
  /**
   * Use to set a cookie `name` with `value`.
   */
  setCookie: (name: string, value: string) => void;
}

let contextStore = new AsyncLocalStorage<ServerContext>();

export const initialContextStore = contextStore;

/**
 * INTERNAL: Do not use
 */
// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
export function __initContextStore(store: AsyncLocalStorage<ServerContext>) {
  contextStore = store;
}

export function getServerContext(): ServerContext | undefined {
  return contextStore.getStore();
}

export function createServerContext(req: IncomingMessage, res: ServerResponse): ServerContext {
  const cookies = cookie.parse(req.headers.cookie || '');
  return {
    cookies,
    setCookie(name, value) {
      res.setHeader('Set-Cookie', cookie.serialize(name, value, { path: '/' }));
    },
  };
}

export function withContext<R = void>(ctx: ServerContext, doWork: () => Promise<R>): Promise<R> {
  const shouldBypassContext = isWebContainer();

  if (shouldBypassContext) {
    console.warn(
      'Bypassing server context in web containers, see https://github.com/stackblitz/core/issues/2711',
    );
    return doWork();
  }

  return contextStore.run(ctx, doWork);
}
