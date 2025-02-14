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

## Localization

Toolpad components support translations between languages. You can modify text and translations inside Toolpad components in several ways.

The default locale is English (United States). To use other locales, follow the instructions below.

### Set translations globally

#### Using the theme

To translate all your Toolpad components, you can provide translations through the theme:

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { hiIN as coreHiIn } from '@mui/material/locale';
import hiIN from '@toolpad/core/locales/hiIN';

const theme = createTheme({
   {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  coreHiIn,
  hiIN,
});

 // ...
 <AppProvider theme={theme}>{children}</AppProvider>;

```

#### Using the `localeText` prop

If you want to pass language translations without using `createTheme`, you can directly provide them through the `localeText` prop on the `AppProvider`:

```tsx
import { AppProvider } from '@toolpad/core/AppProvider';
import hiIN from '@toolpad/core/locales/hiIN';

function App({ children }) {
  return (
    <AppProvider
      localeText={hiIN.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      {children}
    </AppProvider>
  );
}
```

If you are not using the `AppProvider` in your app, you can just use the `LocalizationProvider`:

```tsx
import { LocalizationProvider } from '@toolpad/core/AppProvider';
import hiIN from '@toolpad/core/locales/hiIN';

function App({ children }) {
  return (
    <LocalizationProvider
      localeText={hiIN.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      {children}
    </LocalizationProvider>
  );
}
```

### Set translations locally

If you want to customize some translations on a specific component, you can use the `localeText` prop exposed by all components.

```tsx
<SignInPage localeText={{ signInTitle: '...' }}></SignInPage>
```

### Priority order

The localization system follows a specific priority order when applying translations:

1. `localeText` prop provided directly to a specific component (highest priority)
2. `localeText` prop provided directly to `AppProvider`
3. Translations provided through the theme
4. Default English translations (lowest priority)

:::info
If you pass a locale text through the `AppProvider` or the theme, and you provide translation keys through the `localeText` prop of a component at the same time, then the latter will override the former to the extent of the keys which it has available:

&nbsp;

```tsx
<AppProvider localeText={{ signInTtle: 'Sign In', accountPreviewTitle: 'Account' }}>
  <Account
    localeText={{
      accountPreviewTitle: 'compte',
    }}
  />
</AppProvider>
```

&nbsp;

This will produce the following result:

- `SignInPage` title with text **Sign In** taken from the `AppProvider` `localeText` prop
- `Account` with title **Compte** overridden by the `Account` `localeText` prop

:::

### Access localization keys

You can access your localization keys in custom components using the `useLocaleText()` hook.

```tsx
import { useLocaleText } from '@toolpad/core/AppProvider';

function CustomMenu() {
  // ...
  const localeText = useLocaleText();
  // ...
}
```
