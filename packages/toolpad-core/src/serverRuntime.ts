import { AsyncLocalStorage } from 'node:async_hooks';
import { IncomingMessage, ServerResponse } from 'node:http';
import * as cookie from 'cookie';
import { isWebContainer } from '@webcontainer/env';
import { User } from '@auth/core/types';
import type express from 'express';
import { getUserToken } from './auth';

export interface ServerContext {
  /**
   * A dictionary mapping cookie name to cookie value.
   */
  cookies: Record<string, string>;
  /**
   * Use to set a cookie `name` with `value`.
   */
  setCookie: (name: string, value: string) => void;
  user: User | null;
}

const contextStore = new AsyncLocalStorage<ServerContext>();

export function getServerContext(): ServerContext | undefined {
  return contextStore.getStore();
}

export async function createServerContext(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<ServerContext> {
  const cookies = cookie.parse(req.headers.cookie || '');

  const token = await getUserToken(req as express.Request);
  const user = token && {
    id: token.sub,
    name: token.name,
    email: token.email,
    image: token.picture,
    roles: token.roles,
  };

  return {
    cookies,
    setCookie(name, value) {
      res.setHeader('Set-Cookie', cookie.serialize(name, value, { path: '/' }));
    },
    user,
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
