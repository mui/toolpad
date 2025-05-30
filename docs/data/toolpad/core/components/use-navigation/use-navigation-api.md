# useNavigation API

<p class="description">API reference for the useNavigation hook.</p>

:::success
For details on the usage of this React hook, visit the demo page:

- [useNavigation](/toolpad/core/react-use-navigation/)

:::

## Import

```js
import useNavigation from '@toolpad/core/useNavigation';
// or
import { useNavigation } from '@toolpad/core';
```

Learn about the difference by reading this [guide](https://mui.com/material-ui/guides/minimizing-bundle-size/) on minimizing bundle size.

## Usage

You can access the current value of the `NavigationContext` by invoking the hook inside your components:

```tsx
import { useNavigation } from '@toolpad/core/useNavigation';

function MyComponent() {
  // ...
  const navigation = useNavigation();
  // ...
}
```

The default `Navigation` interface exported by `@toolpad/core` has the following fields:

```ts
export type Navigation = NavigationItem[];

export type NavigationItem =
  | NavigationPageItem
  | NavigationSubheaderItem
  | NavigationDividerItem;

export interface NavigationPageItem {
  kind?: 'page';
  segment?: string;
  title?: string;
  icon?: React.ReactNode;
  pattern?: string;
  action?: React.ReactNode;
  children?: Navigation;
}

export interface NavigationSubheaderItem {
  kind: 'header';
  title: string;
}

export interface NavigationDividerItem {
  kind: 'divider';
}
```
