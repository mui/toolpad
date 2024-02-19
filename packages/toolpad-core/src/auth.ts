import type express from 'express';
import { JWT, getToken } from '@auth/core/jwt';
import { adaptRequestFromExpressToFetch } from '@mui/toolpad-utils/httpApiAdapters';

export async function getUserToken(req: express.Request): Promise<JWT | null> {
  let token = null;
  if (process.env.TOOLPAD_AUTH_SECRET) {
    const request = adaptRequestFromExpressToFetch(req);

    // @TODO: Library types are wrong as salt should not be required, remove once fixed
    // Github discussion: https://github.com/nextauthjs/next-auth/discussions/9133
    // @ts-ignore
    token = await getToken({
      req: request,
      secret: process.env.TOOLPAD_AUTH_SECRET,
    });
  }

  return token;
}
