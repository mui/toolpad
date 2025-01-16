---
title: Toolpad Core - Base Concepts
---

# Base concepts

<p class="description">Understand the fundamental concepts of Toolpad Core to effectively integrate and use it in your projects.</p>

## Imports

Toolpad Core components can be imported directly from the `@toolpad/core` package. This allows you to use them alongside your existing Material UI or other components.

```tsx
import Button from '@mui/material/Button';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
```

## Component hierarchy

The Toolpad Core library is designed to work under different React runtimes such as Next.js, Vite, or even your custom setup. Many of its components rely on functionality of the specific runtime they are used under. The key component in making the components runtime-aware is the `AppProvider`.

### App Provider

The `AppProvider` acts as a bridge between your application's runtime and Toolpad components. It should wrap your entire application or the part of your application where you want to use Toolpad components.

```tsx
import { AppProvider } from '@toolpad/core/AppProvider';

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}
```

By wrapping your application with `AppProvider`, you ensure that all other Toolpad components you use have access to the necessary context and functionality.

The `AppProvider` component accepts props to configure the app's navigation, theme, branding, router, authentication, and session, like so:

```tsx
<AppProvider
  navigation={NAVIGATION}
  theme={theme}
  branding={BRANDING}
  router={router}
  authentication={AUTHENTICATION}
  session={session}
>
  {props.children}
</AppProvider>
```

Head over to the [AppProvider](/toolpad/core/react-app-provider/) page for more details and examples of the usage of all props.

:::info
Toolpad Core doesn't handle routing itself. Instead, it's designed to integrate seamlessly with your existing routing solution, whether you're using:

- Next.js App Router
- Next.js Pages Router
- React Router
- Or any other routing library which implements the same interface

You can pass the router implementation to the `AppProvider` component using the `router` prop.

:::

:::success
If you are using Next.js, use the `NextAppProvider` exported from `@toolpad/core/nextjs`.

If you are building a single-page application (with [Vite](https://vite.dev/), for example) using React Router for routing, use the `ReactRouterAppProvider` exported from `@toolpad/core/react-router`.

This automatically sets up the router for you, so that you don't need to pass the `router` prop.
:::

## Slots

Toolpad Core uses slots for component customization. Slots allow you to override specific parts of a component, providing flexibility in styling and functionality. You can also pass additional props to specific slots using the `slotProps` prop.

Here's an example using the `SignInPage` component:

```tsx
import { SignInPage } from '@toolpad/core/SignInPage';
function MyComponent() {
  return (
    <SignInPage
      slots={{
        emailField: CustomEmailField,

      }}
      slotProps={{
        passwordField: {
          variant: 'outlined',
        },
      }}
    >
      Custom Button
    </Button>
  );
}
```

In this example:

- The `slots` prop allows you to replace entire parts of the component.
- The `slotProps` prop lets you pass additional props to specific slots.
