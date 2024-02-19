import { AsyncLocalStorage } from 'node:async_hooks';
import { IncomingMessage, ServerResponse } from 'node:http';
import * as cookie from 'cookie';
import { isWebContainer } from '@webcontainer/env';
import type express from 'express';
import { getUserToken } from './auth';

interface ServerContextSessionUser {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  roles?: string[];
}

export interface ServerContext {
  /**
   * A dictionary mapping cookie name to cookie value.
   */
  cookies: Record<string, string>;
  /**
   * Use to set a cookie `name` with `value`.
   */
  setCookie: (name: string, value: string) => void;
  /**
   * Data about current authenticated session.
   */
  session: { user: ServerContextSessionUser } | null;
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
  const session = token && {
    user: {
      name: token.name,
      email: token.email,
      avatar: token.picture,
      roles: token.roles,
    },
  };

  return {
    cookies,
    setCookie(name, value) {
      res.setHeader('Set-Cookie', cookie.serialize(name, value, { path: '/' }));
    },
    session,
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
