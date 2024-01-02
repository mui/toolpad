import express, { Router } from 'express';
import { Auth } from '@auth/core';
import GithubProvider from '@auth/core/providers/github';
import GoogleProvider from '@auth/core/providers/google';
import { getToken } from '@auth/core/jwt';
import { asyncHandler } from '../utils/express';
import { adaptRequestFromExpressToFetch } from './httpApiAdapters';
import { ToolpadProject } from './localMode';
import * as appDom from '../appDom';

export function createAuthHandler(base: string): Router {
  const router = express.Router();

  router.use(
    '/*',
    asyncHandler(async (req, res) => {
      const request = adaptRequestFromExpressToFetch(req);

      const response = (await Auth(request, {
        pages: {
          signIn: `${base}/signin`,
          signOut: base,
          error: `${base}/signin`, // Error code passed in query string as ?error=
          verifyRequest: base,
        },
        providers: [
          GithubProvider({
            clientId: process.env.TOOLPAD_GITHUB_ID,
            clientSecret: process.env.TOOLPAD_GITHUB_SECRET,
          }),
          GoogleProvider({
            clientId: process.env.TOOLPAD_GOOGLE_CLIENT_ID,
            clientSecret: process.env.TOOLPAD_GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code',
              },
            },
          }),
        ],
        secret: process.env.TOOLPAD_AUTH_SECRET,
        trustHost: true,
        callbacks: {
          async signIn({ account, profile }) {
            if (account?.provider === 'google') {
              return Boolean(
                profile?.email_verified &&
                  profile?.email &&
                  (!process.env.TOOLPAD_GOOGLE_AUTH_DOMAIN ||
                    profile.email.endsWith(`@${process.env.TOOLPAD_GOOGLE_AUTH_DOMAIN}`)),
              );
            }
            return true;
          },
          async redirect({ baseUrl }) {
            return `${baseUrl}${base}`;
          },
        },
      })) as Response;

      // Converting Fetch API's Response to Express' res
      res.status(response.status);
      res.contentType(response.headers.get('content-type') ?? 'text/plain');
      response.headers.forEach((value, key) => {
        if (value) {
          res.setHeader(key, value);
        }
      });
      const body = await response.text();
      res.send(body);
    }),
  );

  return router;
}

export async function createAuthPagesMiddleware(project: ToolpadProject) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { options } = project;
    const { base } = options;

    const dom = await project.loadDom();

    const app = appDom.getApp(dom);

    const authProviders = app.attributes.authentication?.providers ?? [];

    const hasAuthentication = authProviders.length > 0;

    const signInPath = `${base}/signin`;

    if (
      hasAuthentication &&
      req.get('sec-fetch-dest') === 'document' &&
      req.originalUrl !== signInPath &&
      !req.originalUrl.startsWith(`${base}/api/auth`)
    ) {
      const request = adaptRequestFromExpressToFetch(req);

      let token;
      if (process.env.TOOLPAD_AUTH_SECRET) {
        // @TODO: Library types are wrong as salt should not be required, remove once fixed
        // Github discussion: https://github.com/nextauthjs/next-auth/discussions/9133
        // @ts-ignore
        token = await getToken({
          req: request,
          secret: process.env.TOOLPAD_AUTH_SECRET,
        });
      }

      if (!token) {
        res.redirect(signInPath);
        res.end();
      } else {
        next();
      }
    } else {
      next();
    }
  };
}
