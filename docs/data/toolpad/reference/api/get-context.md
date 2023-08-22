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

## types

### ServerContext

This described a certain context under which a backend function was called.

**Properties**

| Name      | Type                     | Description                                       |
| :-------- | :----------------------- | :------------------------------------------------ |
| `cookies` | `Record<string, string>` | A dictionary mapping cookie name to cookie value. |

## Usage

:::info
See [custom functions](/toolpad/concepts/custom-functions/)
:::
