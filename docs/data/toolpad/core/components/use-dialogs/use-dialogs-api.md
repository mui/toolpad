# useDialogs API

<p class="description">API reference for the useDialogs hook.</p>

:::success
For examples and details on the usage of this React hook, visit the demo pages:

- [useDialogs](/toolpad/core/react-use-dialogs/)

:::

## Import

```js
import useDialogs from '@toolpad/core/useDialogs';
// or
import { useDialogs } from '@toolpad/core';
```

Learn about the difference by reading this [guide](https://mui.com/material-ui/guides/minimizing-bundle-size/) on minimizing bundle size.

## Usage

Get access to the dialogs API by invoking the hook.

```js
const dialogs = useDialogs();
```

## Reference

### `dialogs.alert`

Open an alert dialog, returns a promise that resolves when the user closes the dialog.

```js
await dialogs.alert('Something went wrong', {
  title: 'Attention!',
});
```

**Signature:**

```js
function alert(message, options?)
```

**Parameters:**

- `message`: `React.ReactNode` The message to display in the alert dialog.
- `options?`: `object` Extra configuration for the alert dialog.
  - `onClose?`: `() => Promise<void>` A function that is called before closing the dialog closes. The dialog stays open as long as the returned promise is not resolved. Use this if you want to perform an async action on close and show a loading state.
  - `title?`: `React.ReactNode` A title for the dialog. Defaults to `'Alert'`.
  - `okText?`: `React.ReactNode` The text to show in the "Ok" button. Defaults to `'Ok'`.

**Returns:**

`Promise<void>` A promise that resolves once the user has dismissed the dialog.

### `dialogs.confirm`

Open a confirmation dialog. Returns a promise that resolves to true if the user confirms, false if the user cancels.

```js
const confirmed = await dialogs.confirm('Are you sure?', {
  okText: 'Yes',
  cancelText: 'No',
});
```

**Signature:**

```js
function confirm(message, options?)
```

**Parameters:**

- `message`: `React.ReactNode` The message to display in the confirmation dialog.
- `options?`: `object` Extra configuration for the confirmation dialog.
  - `onClose?`: `(result: boolean) => Promise<void>` A function that is called before closing the dialog closes. The dialog stays open as long as the returned promise is not resolved. Use this if you want to perform an async action on close and show a loading state.
  - `title?`: `React.ReactNode` A title for the dialog. Defaults to `'Confirm'`.
  - `okText?`: `React.ReactNode` The text to show in the "Ok" button. Defaults to `'Ok'`.
  - `severity?`: `'error' | 'info' | 'success' | 'warning'` Denotes the purpose of the dialog. This will affect the color of the "Ok" button. Defaults to `undefined`.
  - `cancelText?`: `React.ReactNode` The text to show in the "Cancel" button. Defaults to `'Cancel'`.

**Returns:**

`Promise<boolean>` A promise that resolves to true if the user confirms, false if the user cancels.

### `dialogs.prompt`

Open a prompt dialog to request user input. Returns a promise that resolves to the input if the user confirms, null if the user cancels.

```js
const input = await dialogs.prompt('What is your name?', {
  cancelText: 'Leave me alone',
});
```

**Signature:**

```js
function prompt(message, options?)
```

**Parameters:**

- `message`: `React.ReactNode` The message to display in the prompt dialog.
- `options?`: `object` Extra configuration for the prompt dialog.
  - `onClose?`: `(result: string) => Promise<void>` A function that is called before closing the dialog closes. The dialog stays open as long as the returned promise is not resolved. Use this if you want to perform an async action on close and show a loading state.
  - `title?`: `React.ReactNode` A title for the dialog. Defaults to `'Prompt'`.
  - `okText?`: `React.ReactNode` The text to show in the "Ok" button. Defaults to `'Ok'`.
  - `cancelText?`: `React.ReactNode` The text to show in the "Cancel" button. Defaults to `'Cancel'`.

**Returns:**

`Promise<string>` A promise that resolves to the user input if the user confirms, null if the user cancels.

### `dialogs.open`

Open a custom dialog. The dialog is a React component that optionally takes a payload and optionally returns a result in its `onClose` property.

```js
function MyDialog({ open, onClose, payload }) {
  // ...
}

const result = await dialogs.open(MyDialog, 123, {
  onClose: async (result) => callApi(result),
});
```

**Signature:**

```js
function open(component, payload, options?)
```

**Parameters:**

- `component`: `React.ComponentType<{ open: boolean, onClose: (result: R) => Promise<void>, payload: P }>` The dialog component to display.
- `payload?`: `P` The optional payload passed to the dialog. Useful if you want to parametrize the dialog, or use instance specific data. This value will be kept constant during the lifetime of the dialog.
- `options?`: `object` Extra configuration for the dialog.
  - `onClose?`: `(result: R) => Promise<void>` A function that is called before closing the dialog closes. The dialog stays open as long as the returned promise is not resolved. Use this if you want to perform an async action on close and show a loading state.

**Returns:**

`Promise<R>` A promise that resolves to the user input if the user confirms, null if the user cancels.

### `dialogs.close`

Programmatically close a dialog that was previously opened with `dialogs.open`. If the dialog returns a result, `close` must also be called with a result. The original dialog promise will be resolved with this result. This promise is also returned from the `close` function.

```js
const myDialog = dialogs.open(/* ... */);

// ...

const result = await dialogs.close(myDialog, 123);
```

**Signature:**

```js
function close(dialog, result)
```

**Parameters:**

- `dialog`: `Promise<R>` The dialog to close. This should be a promise that was previously returned by `dialogs.open`.
- `result?`: `R` The result to return from the dialog.

**Returns:**

`Promise<R>` A promise that resolves with the dialog result when the dialog is fully closed.
