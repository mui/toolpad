import express, { Router } from 'express';
import { Auth } from '@auth/core';
import GithubProvider from '@auth/core/providers/github';
import GoogleProvider from '@auth/core/providers/google';
import { asyncHandler } from '../utils/express';
import { encodeRequestBody } from './httpApiAdapters';

export function createAuthHandler(base: string): Router {
  const router = express.Router();

  router.use(
    '/*',
    asyncHandler(async (req, res) => {
      // Converting Express req headers to Fetch API's Headers
      const headers = new Headers();
      for (const headerName of Object.keys(req.headers)) {
        const headerValue: string = req.headers[headerName]?.toString() ?? '';
        if (Array.isArray(headerValue)) {
          for (const value of headerValue) {
            headers.append(headerName, value);
          }
        } else {
          headers.append(headerName, headerValue);
        }
      }

      // Creating Fetch API's Request object from Express' req
      const request = new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`, {
        method: req.method,
        headers,
        body: /GET|HEAD/.test(req.method) ? undefined : encodeRequestBody(req),
      });

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
