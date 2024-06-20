# useSessionStorageState API

<p class="description">API reference for the useSessionStorageState hook.</p>

:::success
For examples and details on the usage of this React hook, visit the demo pages:

- [useSessionStorageState](/toolpad/core/react-persistent-state/)

:::

## Import

```js
import useSessionStorageState from '@toolpad/core/useSessionStorageState';
// or
import { useSessionStorageState } from '@toolpad/core';
```

Learn about the difference by reading this [guide](https://mui.com/material-ui/guides/minimizing-bundle-size/) on minimizing bundle size.

## Reference

### `useSessionStorageState`

```js
const [state, setState] = useSessionStorageState('my-key', 'initial value');
```

**Parameters**

- `key`: `string | null`
- `initialValue`: `T | null`
- `options?`: `object`
  - `codec?`: `Codec<T>`
