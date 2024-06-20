# useLocalStorageState API

<p class="description">API reference for the useLocalStorageState hook.</p>

:::success
For examples and details on the usage of this React hook, visit the demo pages:

- [useLocalStorageState](/toolpad/core/react-persistent-state/)

:::

## Import

```js
import useLocalStorageState from '@toolpad/core/useLocalStorageState';
// or
import { useLocalStorageState } from '@toolpad/core';
```

Learn about the difference by reading this [guide](https://mui.com/material-ui/guides/minimizing-bundle-size/) on minimizing bundle size.

## Reference

### `useLocalStorageState`

```js
const [state, setState] = useLocalStorageState('my-key', 'initial value');
```

**Parameters**

- `key`: `string | null`
- `initialValue`: `T | null`
- `options?`: `object`
  - `codec?`: `Codec<T>`
