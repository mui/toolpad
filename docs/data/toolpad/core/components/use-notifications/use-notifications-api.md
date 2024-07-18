# useNotifications API

<p class="description">API reference for the useNotifications hook.</p>

:::success
For examples and details on the usage of this React hook, visit the demo pages:

- [useNotifications](/toolpad/core/react-use-notifications/)

:::

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

Call the `notifications.show` method to show a snackbar in the application.

```js
const notification = notifications.show('Something great just happened!', {
  severity: 'success',
});
```

**Signature:**

```js
function show(message, options?)
```

**Parameters:**

- `message`: `React.ReactNode` The message to show in the snackbar.
- `options?`: `object` An options object to configure the notification. -`key?`: `string` The key to use for deduping notifications. If not provided, a unique key will be generated.
  - `severity?`: `'info' | 'warning' | 'error' | 'success'` The severity of the notification. When provided, the snackbar will show an alert with the specified severity. Defaults to `undefined`.
  - `autoHideDuration?`: `number` The duration in milliseconds after which the notification will automatically close. By default notifications don't hide automatically.
  - `actionText?`: `React.ReactNode` The text to display on the action button.
  - `onAction?`: `() => void` The callback to call when the action button is clicked.

**Returns**

A unique key that can be used to close the notification programmatically.

### `notifications.close`

programmaticaly closes a notification.

```js
const notification = notifications.show(/* ... */);

// ...

notifications.close(notification);
```

**Signature:**

```js
function close(notification)
```

**Parameters**

- `key`: `string`

**Returns**

`void`
