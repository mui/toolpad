---
productId: toolpad-core
title: useSession
---

# useSession

<p class="description">Toolpad Core exposes an API to access the current authentication session, regardless of the underlying authentication provider used.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

## Usage

When using authentication features inside Toolpad Core, a `SessionContext` is created to share session information among all Toolpad Core components. This accepts a default value from the `session` prop of the `AppProvider`.

```js
<AppProvider session={session}>{props.children}</AppProvider>
```

The `session` can be created using any authentication provider of your choice. You can access the current value of the `SessionContext` inside Toolpad Core components by invoking the hook:

```js
const session = useSession();
```

If your session has additional data which you want to display in the account popover, you an create custom components for user information display with the session object:

```ts
interface CustomSession  {
  org: {
    name: string;
    url: string;
    logo: string;
  };
}

function CustomAccountDetails() {

  const session = useSession<CustomSession>();
  return (
    // Use `session.org`
  )
}
```

The following example demonstrates this behaviour clearly:

{{"demo": "../account/AccountCustomUserDetails.js", "bg":"outlined"}}

## Hook API

- [`useSession()`](/toolpad/core/react-use-session/api/)
