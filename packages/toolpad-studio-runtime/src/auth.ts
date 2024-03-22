import type express from 'express';
import { getToken } from '@auth/core/jwt';
import { adaptRequestFromExpressToFetch } from '@toolpad/utils/httpApiAdapters';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import * as cookie from 'cookie';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  roles?: string[];
}

export type Session = { user: SessionUser } | null;

export async function getSession(req: express.Request): Promise<Session | null> {
  const session = null;
  if (process.env.TOOLPAD_AUTH_SECRET) {
    const firebaseAdapter = FirestoreAdapter();

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && firebaseAdapter.getSessionAndUser) {
      const parsedCookies = cookie.parse(req.headers.cookie ?? '');

      const sessionToken = parsedCookies['authjs.session-token'];

      const firebaseSessionAndUser = sessionToken
        ? await firebaseAdapter.getSessionAndUser(sessionToken)
        : null;

      return (
        firebaseSessionAndUser && {
          user: {
            name: firebaseSessionAndUser.user.name,
            email: firebaseSessionAndUser.user.email,
            avatar: firebaseSessionAndUser.user.image,
            roles: [],
          },
        }
      );
    }

    const request = adaptRequestFromExpressToFetch(req);

    // @TODO: Library types are wrong as salt should not be required, remove once fixed
    // Github discussion: https://github.com/nextauthjs/next-auth/discussions/9133
    // @ts-ignore
    const token = await getToken({
      req: request,
      secret: process.env.TOOLPAD_AUTH_SECRET,
    });

    return (
      token && {
        user: {
          name: token.name,
          email: token.email,
          avatar: token.picture,
          roles: token.roles,
        },
      }
    );
  }

  return session;
}
