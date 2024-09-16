---
title: Toolpad Core - Base Concepts
---

# Base Concepts

<p class="description">Understand the fundamental concepts of Toolpad Core to effectively integrate and use it in your projects.</p>

## Imports

Toolpad Core components can be imported directly from the `@toolpad/core` package. This allows you to use them alongside your existing Material UI or other components.

```tsx
import { Button } from '@mui/material';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
```

## Component Hierarchy

The Toolpad Core library is designed to work within your existing React application structure. The key component in this hierarchy is the `AppProvider`.

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

#### AppProvider Customization

The `AppProvider` component accepts props to configure the app's theme, branding, router, authentication, and session. Here's a quick overview of what you can do with some of them:

- `theme`: The theme to be used by the app in light/dark mode. If you are using [Material UI with a custom theme](https://mui.com/material-ui/customization/theming/), you can directly pass it here.

  ```tsx
  import { createTheme } from '@mui/material';
  import { AppProvider } from '@toolpad/core/AppProvider';

  const customTheme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: {
      light: {
        // ...
      },
      dark: {
        // ...
      },
    },
  });

  function MyApp({ Component, pageProps }) {
    return <AppProvider theme={theme}>/* Your App */</AppProvider>;
  }
  ```

- `router`: Router implementation used to navigate between pages. This is the same router that you use in your application.

  :::info
  Toolpad Core doesn't handle routing itself. Instead, it's designed to integrate seamlessly with your existing routing solution, whether you're using:

  - Next.js App Router
  - Next.js Pages Router
  - React Router
  - Or any other routing library which implements the same interface

  You can pass the router implementation to the `AppProvider` component using the `router` prop. You do not need to pass this prop if you are using Next.js, since it has a file-system based router.

  :::

- `authentication`: Authentication implementation used inside Toolpad components.

- `session`: Session implementation used inside Toolpad components.

  ```tsx
  import { AppProvider } from '@toolpad/core/AppProvider';
  import { SessionProvider, signIn, signOut } from 'next-auth/react';
  import { auth } from '../auth';

  function MyApp({ Component, pageProps }) {
    const session = await auth();
    return (
      <SessionProvider session={session}>
        <AppProvider authentication={{ signIn, signOut }} session={session}>
          ..
        </AppProvider>
      </SessionProvider>
    );
  }
  ```

:::info
See the [AppProvider](/toolpad/core/react-app-provider/) page for more details and examples of the usage of all props.
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

## Next Steps

Now that you understand the basic concepts of Toolpad Core, you're ready to start integrating it into your project. Head over to the [integration docs](/toolpad/core/introduction/integration/) to learn more.
