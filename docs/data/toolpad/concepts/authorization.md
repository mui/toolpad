# Authorization

<p class="description">Restrict a Toolpad application or some of its pages to certain authenticated users.</p>

You can configure a Toolpad application so that users have to sign in with specific authentication providers in order to access it.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/authorization/sign-in-page.png", "alt": "Toolpad sign-in page", "caption": "Toolpad sign-in page", "indent": 1, "aspectRatio": 1 }}

Authentication settings can be accessed through the **Authorization** option in the app editor header.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/authorization/authentication-settings.png", "alt": "Authentication settings", "caption": "Authentication settings", "indent": 1, "aspectRatio": 6 }}

## Authentication secret

To enable any authorization features, you must set a random string to be used as a secret in the `TOOLPAD_AUTH_SECRET` environment variable.

This secret will be used to hash tokens, sign/encrypt cookies and generate cryptographic keys.

You can quickly create a good value on the command line with this `openssl` command:

```bash
openssl rand -base64 32
```

## Authentication providers

In the authentication settings, you can set up one or more authentication providers for users to be able to sign in with, such as Github and Google.

If any authentication providers are set, only authenticated users are able to access your Toolpad application.

Each authentication provider has its own configuration options, to be set with certain environment variables.

### Github

| environment variable name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | description                     |
| :------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `TOOLPAD_GITHUB_CLIENT_ID`                                                                                                                               | Github OAuth app client ID.     |
| `TOOLPAD_GITHUB_CLIENT_SECRET`                                                                                                                           | Github OAuth app client secret. |

Take a look at the following official instructions to [create a Github OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

In the Github OAuth app settings screen, in the **Authorization callback URL** option, use the production path of your application followed by `/api/auth/callback/github`, as in `http://mui.com/api/auth/callback/github`.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/authorization/github-callback-url.png", "alt": "Github callback URL configuration", "caption": "Github callback URL configuration", "zoom": false, "width": 460 }}

### Google

| environment variable name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | description                 |
| :------------------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| `TOOLPAD_GOOGLE_CLIENT_ID`                                                                                                 | Google OAuth client ID.     |
| `TOOLPAD_GOOGLE_CLIENT_SECRET`                                                                                             | Google OAuth client secret. |

Take a look at the following official instructions to [create a Google OAuth client ID](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id).

In the Google OAuth client settings screen, under the **Authorized redirect URIs** option, make sure to include the production path of your application followed by `/api/auth/callback/google`, as in `http://mui.com/api/auth/callback/google`.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/authorization/google-redirect-url.png", "alt": "Google redirect URIs configuration", "caption": "Google redirect URIs configuration", "zoom": false, "width": 460 }}

## Restricted domains

In the authentication settings, you can specify one or more domains (such as `mui.com`) to restrict user authentication based on the signed-in user's email address.

If any restricted domains are set, the user must have at least one verified email assigned to their current authentication provider that belongs to one of those domains, otherwise they will not be able to sign in.
