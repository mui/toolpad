---
productId: toolpad-core
title: useNavigation
---

# useNavigation

<p class="description">Toolpad Core exposes an API to access the current navigation definition.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

## Usage

When a navigation is set in Toolpad Core, a `NavigationContext` is used to share navigation information among all Toolpad Core components, with the value from the `navigation` prop of the `AppProvider`:

```js
<AppProvider navigation={navigation}>{props.children}</AppProvider>
```

You can access the current value of the `NavigationContext` by invoking the hook inside your components:

```js
import { useNavigation } from '@toolpad/core/useNavigation';

function MyComponent() {
  // ...
  const navigation = useNavigation();
  // ...
}
```

## Hook API

- [`useNavigation()`](/toolpad/core/react-use-navigation/api/)
