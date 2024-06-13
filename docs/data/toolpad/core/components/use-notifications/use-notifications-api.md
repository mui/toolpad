# useNotifications API

<p class="description">API reference for the useNotifications hook.</p>

## Import

```js
import useNotifications from '@toolpad/core/useNotifications';
// or
import { useNotifications } from '@toolpad/core';
```

Learn about the difference by reading this [guide](https://mui.com/material-ui/guides/minimizing-bundle-size/) on minimizing bundle size.

## Usage

Get access to the notifications API by invoking the hook.

```js
const notifications = useNotifications();
```

## Reference

### `notifications.show`

```js
const notification = notifications.show('Something great just happened!', {
  severity: 'success',
});
```

### `notifications.close`
