# getContext API

<p class="description">Support reading contextual information in backend functions.</p>

```jsx
import { getContext } from '@mui/toolpad/server';
```

## Description

```jsx
import { getContext } from '@mui/toolpad/server';
import { parseAuth } from '../../src/lib/auth';

export async function myBackendFunction() {
  const ctx = getContext();
  const user = await parseAuth(ctx.cookie.authentication);
  return user?.id;
}
```

Within backend functions, you can call `getContext` to get access to the request context that resulted in calling this backend function. This is useful if you are running Toolpad in an authenticated context and want to reuse access tokens available in a cookie.

## Parameters

No parameters

## Returns

a `ServerContext` containing information on the context the backend function was called under.

## Types

### ServerContext

This describes a certain context under which a backend function was called.

**Properties**

| Name        | Type                                         | Description                                                                  |
| :---------- | :------------------------------------------- | :--------------------------------------------------------------------------- |
| `cookies`   | `Record<string, string>`                     | A dictionary mapping cookie name to cookie value.                            |
| `setCookie` | `(name: string, value: string) => void`      | Use to set a cookie `name` with `value`.                                     |
| `session`   | `{ user: ServerContextSessionUser } \| null` | Get current [authenticated](/toolpad/concepts/authentication/) session data. |

### ServerContextSessionUser

**Properties**

| Name      | Type             | Description                                                 |
| :-------- | :--------------- | :---------------------------------------------------------- |
| `name?`   | `string \| null` | Logged-in user name.                                        |
| `email?`  | `string \| null` | Logged-in user email.                                       |
| `avatar?` | `string \| null` | Logged-in user avatar image URL.                            |
| `roles`   | `string[]`       | Logged-in user [roles](/toolpad/concepts/rbac/) in Toolpad. |

## Usage

:::info
See [custom functions](/toolpad/concepts/custom-functions/)
:::
