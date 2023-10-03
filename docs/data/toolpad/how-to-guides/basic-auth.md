# Enable basic authentication

<p class="description">Add basic authentication to your Toolpad application.</p>

You can integrate [basic auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme) into your Toolpad applications using a simple environment variable configuration

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/how-to-guides/basic-auth/basic-auth.png", "alt": "Basic auth", "caption": "Basic auth in Toolpad", "indent": 1}}

## Environment variables

Toolpad supports the following environment variables to configure applications:

| Variable                      | Description                      |
| :---------------------------- | :------------------------------- |
| `TOOLPAD_BASIC_AUTH_USER`     | This variable sets the user name |
| `TOOLPAD_BASIC_AUTH_PASSWORD` | This variable sets the password  |
