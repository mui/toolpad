---
title: TanStack Router - Integration
---

# TanStack Router

<p class="description">To integrate Toolpad Core into a project that uses TanStack Router, follow these steps.</p>

## Wrap all routes in a `TanStackRouterAppProvider`

In the root route (for example `src/routes/__root.tsx`), wrap all the route page content in the `TanStackRouterAppProvider` from `@toolpad/core/tanstack-router`.

```tsx title="src/routes/__root.tsx"
import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { TanStackRouterAppProvider } from '@toolpad/core/tanstack-router';
import type { Navigation } from '@toolpad/core/AppProvider';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

function App() {
  return (
    <TanStackRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </TanStackRouterAppProvider>
  );
}

export const Route = createRootRoute({
  component: App,
});
```

## Create a dashboard layout

Place all your other routes under a `_layout` folder, where the `_layout/route.tsx` file defines a shared layout to be used by all those routes. The `<Outlet />` component from `@tanstack/react-router` should also be used:

```tsx title="src/routes/_layout/route.tsx"
import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

function Layout() {
  return (
    <DashboardLayout>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_layout')({
  component: Layout,
});
```

The [`DashboardLayout`](/toolpad/core/react-dashboard-layout/) component provides a consistent layout for your dashboard pages, including a sidebar, navigation, and header. The [`PageContainer`](/toolpad/core/react-page-container/) component is used to wrap the page content, and provides breadcrumbs for navigation.

## Create pages

Create a dashboard page (for example `src/routes/_layout/index.tsx`) and an orders page (`src/routes/_layout/orders.tsx`).

```tsx title="src/routes/_layout/index.tsx
import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Typography from '@mui/material/Typography';

function DashboardPage() {
  return <Typography>Welcome to Toolpad!</Typography>;
}

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
});
```

```tsx title="src/routes/_layout/orders.tsx"
import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Typography from '@mui/material/Typography';

function OrdersPage() {
  return <Typography>Welcome to the Toolpad orders!</Typography>;
}

export const Route = createFileRoute('/_layout/orders')({
  component: OrdersPage,
});
```

That's it! You now have Toolpad Core integrated into your project with TanStack Router!

<!-- :::info
@TODO: Uncomment when example is live
For a full working example, see the [Toolpad Core Vite app with TanStack Router example](https://github.com/mui/toolpad/tree/master/examples/core/vite-tanstack-router/)
::: -->
