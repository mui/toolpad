import express, { Router } from 'express';
import { Auth } from '@auth/core';
import GithubProvider from '@auth/core/providers/github';
import GoogleProvider from '@auth/core/providers/google';
import { JWT, getToken } from '@auth/core/jwt';
import { Session } from '@auth/core/types';
import { asyncHandler } from '../utils/express';
import * as appDom from '../appDom';
import { ToolpadProject } from './localMode';
import { adaptRequestFromExpressToFetch } from './httpApiAdapters';

async function getProfileRoles(email: string, project: ToolpadProject) {
  const dom = await project.loadDom();

  const app = appDom.getApp(dom);

  let roles: string[] = [];
  if (email) {
    const authUser = app.attributes.authorization?.users?.find((user) => user.email === email);
    roles = authUser?.roles ?? [];
  }

  return roles;
}

export function createAuthHandler(project: ToolpadProject): Router {
  const { options } = project;
  const { base } = options;

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
            async profile(profile) {
              const roles = await getProfileRoles(profile.email ?? '', project);

              return {
                ...profile,
                id: profile.email ?? String(profile.id),
                name: profile.name,
                email: profile.email,
                image: profile.avatar_url,
                roles,
              };
            },
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
            async profile(profile) {
              const roles = await getProfileRoles(profile.email, project);

              return {
                id: profile.email,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                roles,
              };
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
          jwt({ token, user }) {
            if (user) {
              token.roles = user.roles ?? [];
            }
            return token;
          },
          // @TODO: Types for session callback are broken as it says token does not exist but it does
          // Github issue: https://github.com/nextauthjs/next-auth/issues/9437
          // @ts-ignore
          session({ session, token }) {
            if (session.user) {
              session.user.roles = token.roles ?? [];
            }

            return session;
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
