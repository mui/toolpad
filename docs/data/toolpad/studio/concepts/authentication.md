# Authentication

<p class="description">Restrict a Toolpad Studio application to authenticated users only, under certain authentication providers.</p>

You can configure a Toolpad Studio application so that users have to sign in with specific authentication providers in order to access it.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/authorization/sign-in-page.png", "alt": "Toolpad Studio sign-in page", "caption": "Toolpad Studio sign-in page", "indent": 1, "aspectRatio": 1 }}

Authentication settings can be accessed through the **Authorization** option in the app editor header.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/authorization/authentication-settings.png", "alt": "Authentication settings", "caption": "Authentication settings", "indent": 1, "aspectRatio": 6 }}

## Authentication secret

To enable any authorization features, you must set a random string to be used as a secret in the `TOOLPAD_AUTH_SECRET` environment variable.

This secret will be used to hash tokens, sign/encrypt cookies and generate cryptographic keys.

You can quickly create a good value on the command line with this `openssl` command:

```bash
openssl rand -base64 32
```

:::warning
Please make sure to keep this secret safe and do not share it with anyone!
:::

## Authentication providers

In the authentication settings, you can set up one or more authentication providers for users to be able to sign in with, such as GitHub and Google.

If any authentication providers are set, only authenticated users are able to access your Toolpad Studio application.

Each authentication provider has its own configuration options, to be set with certain environment variables.

### GitHub

| environment variable name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | description                     |
| :------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `TOOLPAD_GITHUB_CLIENT_ID`                                                                                                                               | GitHub OAuth app client ID.     |
| `TOOLPAD_GITHUB_CLIENT_SECRET`                                                                                                                           | GitHub OAuth app client secret. |

Take a look at the following official instructions to [create a GitHub OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

In the GitHub OAuth app settings screen, in the **Authorization callback URL** option, use the production path of your application followed by `/api/auth/callback/github`, as in `https://mui.com/api/auth/callback/github`.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/authorization/github-callback-url.png", "alt": "GitHub callback URL configuration", "caption": "GitHub callback URL configuration", "zoom": false, "width": 460 }}

### Google

| environment variable name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | description                 |
| :------------------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| `TOOLPAD_GOOGLE_CLIENT_ID`                                                                                                 | Google OAuth client ID.     |
| `TOOLPAD_GOOGLE_CLIENT_SECRET`                                                                                             | Google OAuth client secret. |

Take a look at the following official instructions to [create a Google OAuth client ID](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id).

In the Google OAuth client settings screen, under the **Authorized redirect URIs** option, make sure to include the production path of your application followed by `/api/auth/callback/google`, as in `https://mui.com/api/auth/callback/google`.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/authorization/google-redirect-url.png", "alt": "Google redirect URIs configuration", "caption": "Google redirect URIs configuration", "zoom": false, "width": 460 }}

### Azure Active Directory (now Entra ID)

:::warning
The Azure AD authentication provider will be a paid feature of Toolpad Studio very soon, so it's only available for free for a limited time.
:::

| environment variable name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | description                                |
| :------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| `TOOLPAD_AZURE_AD_CLIENT_ID`                                                                                               | Azure AD application (client) ID.          |
| `TOOLPAD_AZURE_AD_CLIENT_SECRET`                                                                                           | Azure AD application client secret.        |
| `TOOLPAD_AZURE_AD_TENANT_ID`                                                                                               | Azure AD application directory (tenant) ID |

Follow these steps to configure your Azure AD client and get the necessary environment variables:

1. Go to https://portal.azure.com, search for "Microsoft Entra ID" and go to it.

2. In the left-side menu, go to **App registrations** and create a new app by choosing **New registration**.

3. When registering your application, under the **Redirect URI** option, make sure to include the production path of your application followed by `/api/auth/callback/azure-ad`, as in `https://mui.com/api/auth/callback/azure-ad`.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/authorization/azure-ad-redirect-url.png", "alt": "Azure AD redirect URI configuration", "caption": "Azure AD redirect URI configuration", "aspectRatio": 6 }}

4. Once your application has been created, go to its page in **App registrations** where you can find the client and tenant IDs under the **Overview** option in the left-side menu.

5. Go to **Certificates & secrets** and use the option **New client secret** to generate a client secret.

With the Azure AD provider, only existing users of your Azure AD application will be able to sign in.

## Restricted domains

In the authentication settings, you can specify one or more domains (such as `mui.com`) to restrict user authentication based on the signed-in user's email address.

If any restricted domains are set, the user must have at least one email address assigned to their current authentication provider that belongs to one of those domains, otherwise they will not be able to sign in.
