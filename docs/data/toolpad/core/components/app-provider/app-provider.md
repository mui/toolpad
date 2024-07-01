---
productId: toolpad-core
title: App Provider
components: AppProvider
---

# App Provider

<p class="description">The app provider component provides the necessary context to easily set up a Toolpad application.</p>

By wrapping an application at the root level with an `AppProvider` component, many of Toolpad's features (such as routing, navigation and theming) can be automatically enabled to their fullest extent, abstracting away complexity and helping you focus on the details that matter.

It is not mandatory that every application is wrapped in an `AppProvider`, but it is highly recommended for most apps that use Toolpad.

## Basic

Wrap an application page with the `AppProvider` component.

Ideally, the `AppProvider` should wrap every page in the application, therefore in most projects it should be imported and placed in the file that defines a **shared layout** for all pages.

In the following example, an `AppProvider` component wrapping the page provides it with a default theme, and a `DashboardLayout` placed inside it gets its navigation and routing features automatically set based on the props passed to the `AppProvider`.

{{"demo": "AppProviderBasic.js", "height": 500, "iframe": true}}

## Next.js

The `AppProvider` for Next.js applications includes some Next.js integrations out-of-the-box.

By using the specific `AppProvider` for Next.js you do not have to manually configure the integration between some Toolpad features and the corresponding Next.js features (such as routing), making the integration automatic and seamless.

```tsx
import { AppProvider } from '@toolpad/core/nextjs/AppProvider';
// or
import { AppProvider } from '@toolpad/core/nextjs';
```

### Next.js App Router

When using the **Next.js App Router**, the most typical file where to import and use `AppProvider` will be at the top level `app/layout.tsx` file that defines the layout for all the application pages.

```tsx
// app/layout.tsx

import { AppProvider } from '@toolpad/core/nextjs/AppProvider';

export default function Layout(props) {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
```

### Next.js Pages Router

When using the **Next.js Pages Router**, the most typical file where to import and use `AppProvider` in order to wrap every page in the application will be the `pages/_app.tsx` file.

```tsx
// pages/_app.tsx

import { AppProvider } from '@toolpad/core/nextjs/AppProvider';

export default function App(props) {
  const { Component, pageProps } = props;

  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}
```

## Theming

An `AppProvider` can set a visual theme for all elements inside it to adopt via the `theme` prop. This prop can be set in a few distinct ways with different advantages and disadvantages:

1. [CSS variables theme](https://mui.com/material-ui/experimental-api/css-theme-variables/overview/): the default and recommended theming option for Toolpad applications, as despite being an experimental feature it is the only option that prevents issues such as [dark-mode SSR flickering](https://github.com/mui/material-ui/issues/27651), and it supports both light and dark mode with a single theme definition. The provided default theme in Toolpad, as well as any theme that can be imported from `@toolpad-core/themes` are already in this format.
2. [Standard Material UI theme](https://mui.com/material-ui/customization/theming/): a single standard Material UI theme can be provided as the only theme to be used.
3. **Light and dark themes**: two separate Material UI themes can be provided for light and dark mode in an object with the format `{ light: Theme, dark: Theme }`

{{"demo": "AppProviderTheme.js", "height": 500, "iframe": true}}

### Predefined themes

A set of predefined themes that work well with Toolpad applications can be imported:

```tsx
import { baseTheme } from '@toolpad-core/themes';
```
