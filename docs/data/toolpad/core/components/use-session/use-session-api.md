# useSession API

<p class="description">API reference for the useSession hook.</p>

:::success
For examples and details on the usage of this React hook, visit the demo pages:

- [Account](/toolpad/core/react-account/)
- [useSession](/toolpad/core/react-use-session/)

:::

## Import

```js
import useSession from '@toolpad/core/useSession';
// or
import { useSession } from '@toolpad/core';
```

Learn about the difference by reading this [guide](https://mui.com/material-ui/guides/minimizing-bundle-size/) on minimizing bundle size.

## Usage

You can get access to the current value of the `SessionContext` inside Toolpad Core components by invoking the hook:

```js
const session = useSession();
```

The default `Session` interface exported by `@toolpad/core` has the following fields:

```ts
export interface Session {
  user?: {
    id?: string | null;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}
```
