# Notifications

<p class="description">Imperative APIs to show and interact with application notifications</p>

Toolpad core offers a set of abstractions that make it easier to interact with notifications. Notifications are used to give short updates to the user about things that are happening during the application lifetime. They appear at the bottom of the screen. The Toolpad API allows for opening multiple notifications concurrenlty.

First thing you need to do to get access to the notifications APIs is install the NotificationsProvider.

```js
import { NotificationsProvider } from '@toolpad/core/useNotifications';

function App({ children }) {
  return (
    <React.Fragment>
      {children}
      <NotificationsProvider />
    </React.Fragment>
  );
}
```

To then get acess to the notifications APIs you need to call the `useNotifications` hook.

```js
import { useNotifications } from '@toolpad/core/useNotifications';

function MyApp() {
  const notifications = useNotifications();
  // ...
}
```

:::info
The Toolpad AppProvider automatically comes with notifications installed. You won't need to explicitly add the NotificationsProvider in Toolpad applications.
:::

## Basic notification

You can notify your users with a neutral message by calling `notifications.show`. To have the notification automatically hide, add the `autoHideDuration` option. This expresses the time in milliseconds after which to close the notification.

{{"demo": "BasicNotification.js"}}

## Alert notifications

You can send notifications under the form of alerts with the `severity` property. It takes a value from `"info"`, `"success"`, `"warning"`, or `"error"`.

{{"demo": "AlertNotification.js"}}

## Multiple notifications

Multiple concurrent notifications are stacked and when more than one notification is available, a badge is shown with the amount of open notification. Try it out with the following demo:

{{"demo": "MultipleNotifications.js"}}

## Close notifications

You can programmatically close existing notifications. Each notification has an associated key. You can call the `notifications.close` method with this key to close the opened notification.

{{"demo": "CloseNotification.js"}}

## Dedupe notifications

You can supply your own value for a key to shown notifications to associate them with this key. Notifications with the same key are deduplicated as long as one is already open. If you try to show a notification with the same key, the call is simply ignored.

{{"demo": "DedupeNotification.js"}}

## 🚧 Notification center

When multiple notifications are available, click the badge to open the notification center to show a scrollable list of all available notifications. This feature is not available yet.
