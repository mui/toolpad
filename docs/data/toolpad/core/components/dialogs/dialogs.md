# Dialogs

<p class="description">Imperative APIs to open and interact with dialogs.</p>

Toolpad core offers a set of abstractions that makes interacting with dialogs simpler. It has an imperative API to open and close dialogs, and allows dialogs to be stacked on top of each other.

First thing you need to do is install the DialogProvider at the root of your application.

```tsx
import { DialogProvider } from '@toolpad/core/useDialogs';

function App({ children }) {
  return <DialogProvider>{children}</DialogProvider>;
}
```

:::info
The Toolpad AppProvider automatically comes with dialogs enabled. You won't need to explicitly add the DialogProvider in Toolpad applications.
:::

## Basic dialog

Dialogs are React components that taken `open` and `onClose` properties and return a Dialog component. The `open` property reflects the open state of the dialog and you can call the `onClose` handler to close it.

```js
function MyCustomDialog({ open, onClose }: DialogProps) {
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Custom dialog</DialogTitle>
      <DialogContent>I am a custom dialog</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close me</Button>
      </DialogActions>
    </Dialog>
  );
}
```

To show this dialog you first have to request the dialogs API with the `useDialogs` hook.

```js
import { useDialogs } from '@toolpad/core/useDialogs';

function MyApp() {
  const dialogs = useDialogs();
  // ...
}
```

Now you can call the `dialogs.open` function and pass the component as a first parameter.

{{"demo": "CustomDialog.js"}}

## With dialog payload

You can pass a `payload` to the dialog with the second parameter. The payload stays constant for the lifetime of the dialog.

{{"demo": "CustomDialogWithPayload.js"}}

## With dialog result

A dialog can return a value with the `onClose` handler. The promise returned by the `open` method is resolved with the value that was passed to `onClose`.

{{"demo": "CustomDialogWithResult.js"}}

## System dialogs

Toolpad comes with a set of system dialogs that improve on the native `window.alert`, `window.confirm`, and `window.prompt` APIs. These APIs are very similar, but they create dialogs that follow your application theme.

### Alert

Analog to [`window.alert`](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert) it opens a dialog with a message for the user. The only action to be taken is to acknowledge the message after which the dialog closes.
The dialog title and button text are customizable with the `title` and `okText` properties.

{{"demo": "AlertDialog.js"}}

### Confirm

Analog to [`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) it opens a dialog with a question for the user. The user can either confirm or cancel and the dialog result is a boolean which is `true` when the user confirmed.
The dialog title and button texts are customizable with the `title`, `okText`, and `cancelText` properties.

{{"demo": "ConfirmDialog.js"}}

### Prompt

Analog to [`window.prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) it opens a dialog inquiring the user for some input text. The user can fill the input box and upon confirmation the promise returned from the `prompt` call is resolved with its value. The dialog title and button texts are customizable with the `title`, `okText`, and `cancelText` properties.

{{"demo": "PromptDialog.js"}}
