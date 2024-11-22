---
title: React router - Integration
---

# React Router

<p class="description">To integrate Toolpad Core into a single-page app (with Vite, for example) using React Router, follow these steps.</p>

## Wrap all your pages in an `AppProvider`

In your router configuration (e.g.: `src/main.tsx`), use a shared component or element (e.g.: `src/App.tsx`) as a root **layout route** that wraps the whole application with the `AppProvider` from `@toolpad/core/react-router-dom`.

You must use the `<Outlet />` component from `react-router-dom` in this root layout element or component.

```tsx title="src/main.tsx"
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import DashboardPage from './pages';
import OrdersPage from './pages/orders';

const router = createBrowserRouter([
  {
    Component: App, // root layout route
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

```tsx title="src/App.tsx"
import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { Outlet } from 'react-router-dom';
import type { Navigation } from '@toolpad/core';

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

export default function App() {
  return (
    <AppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </AppProvider>
  );
}
```

## Create a dashboard layout

Create a layout file for your dashboard pages (e.g.: `src/layouts/dashboard.tsx`), to also be used as a layout route with the `<Outlet />` component from `react-router-dom`:

```tsx title="src/layouts/dashboard.tsx"
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout() {
  return (
    <DashboardLayout>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
```

The [`DashboardLayout`](/toolpad/core/react-dashboard-layout/) component provides a consistent layout for your dashboard pages, including a sidebar, navigation, and header. The [`PageContainer`](/toolpad/core/react-page-container/) component is used to wrap the page content, and provides breadcrumbs for navigation.

You can then add this layout component to your React Router configuration (e.g.: `src/main.tsx`), as a child of the root layout route created above.

```tsx title="src/main.tsx"
import Layout from './layouts/dashboard';

//...
const router = createBrowserRouter([
  {
    Component: App, // root layout route
    children: [
      {
        path: '/',
        Component: Layout,
      },
    ],
  },
]);
//...
```

## Create pages

Create a dashboard page (e.g.: `src/pages/index.tsx`) and an orders page (`src/pages/orders.tsx`).

```tsx title="src/pages/index.tsx"
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function DashboardPage() {
  return <Typography>Welcome to Toolpad!</Typography>;
}
```

```tsx title="src/pages/orders.tsx"
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function OrdersPage() {
  return <Typography>Welcome to the Toolpad orders!</Typography>;
}
```

You can then add these page components as routes to your React Router configuration (e.g.: `src/main.tsx`). By adding them as children of the layout route created above, they are automatically wrapped with that dashboard layout:

```tsx title="src/main.tsx"
import DashboardPage from './pages';
import OrdersPage from './pages/orders';

//...
const router = createBrowserRouter([
  {
    Component: App, // root layout route
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '',
            Component: DashboardPage,
          },
          {
            path: 'orders',
            Component: OrdersPage,
          },
        ],
      },
    ],
  },
]);
//...
```

That's it! You now have Toolpad Core integrated into your single-page app with React Router!

{{"demo": "ReactRouter.js", "height": 500, "iframe": true, "hideToolbar": true}}

:::info
For a full working example, see the [Toolpad Core Vite app with React Router example](https://github.com/mui/toolpad/tree/master/examples/core/vite/)
:::

## (Optional) Set up authentication

You can use the `SignInPage` component to add authentication along with an external authentication provider of your choice. The following code demonstrates the code required to set up authentication with a mock provider.

### Define a `SessionContext` to act as the mock authentication provider

```tsx title="src/SessionContext.ts"
import * as React from 'react';
import type { Session } from '@toolpad/core';

export interface SessionContextValue {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const SessionContext = React.createContext<SessionContextValue>({
  session: {},
  setSession: () => {},
});

export function useSession() {
  return React.useContext(SessionContext);
}
```

### Add the mock authentication and session data to the `AppProvider`

```tsx title="src/App.tsx"
import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { Outlet, useNavigate } from 'react-router-dom';
import type { Navigation, Session } from '@toolpad/core';
import { SessionContext } from './SessionContext';

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

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const navigate = useNavigate();

  const signIn = React.useCallback(() => {
    navigate('/sign-in');
  }, [navigate]);

  const signOut = React.useCallback(() => {
    setSession(null);
    navigate('/sign-in');
  }, [navigate]);

  const sessionContextValue = React.useMemo(
    () => ({ session, setSession }),
    [session, setSession],
  );

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <AppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
        session={session}
        authentication={{ signIn, signOut }}
      >
        <Outlet />
      </AppProvider>
    </SessionContext.Provider>
  );
}
```

### Protect routes inside the dashboard layout

```tsx title="src/layouts/dashboard.tsx"
import * as React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useSession } from '../SessionContext';

export default function Layout() {
  const { session } = useSession();
  const location = useLocation();

  if (!session) {
    // Add the `callbackUrl` search parameter
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;

    return <Navigate to={redirectTo} replace />;
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
```

You can protect any page or groups of pages through this mechanism.

### Use the `SignInPage` component to create a sign-in page

```tsx title="src/pages/signIn.tsx"
'use client';
import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';
import type { Session } from '@toolpad/core/AppProvider';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../SessionContext';

const fakeAsyncGetSession = async (formData: any): Promise<Session> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (formData.get('password') === 'password') {
        resolve({
          user: {
            name: 'Bharat Kashyap',
            email: formData.get('email') || '',
            image: 'https://avatars.githubusercontent.com/u/19550456',
          },
        });
      }
      reject(new Error('Incorrect credentials.'));
    }, 1000);
  });
};

export default function SignIn() {
  const { setSession } = useSession();
  const navigate = useNavigate();
  return (
    <SignInPage
      providers={[{ id: 'credentials', name: 'Credentials' }]}
      signIn={async (provider, formData, callbackUrl) => {
        // Demo session
        try {
          const session = await fakeAsyncGetSession(formData);
          if (session) {
            setSession(session);
            navigate(callbackUrl || '/', { replace: true });
            return {};
          }
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : 'An error occurred',
          };
        }
        return {};
      }}
    />
  );
}
```

### Add the sign in page to the router

```tsx title="src/main.tsx"
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import OrdersPage from './pages/orders';
import SignInPage from './pages/signIn';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/',
            Component: DashboardPage,
          },
          {
            path: '/orders',
            Component: OrdersPage,
          },
        ],
      },
      {
        path: '/sign-in',
        Component: SignInPage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

:::info
For a full working example, see the [Toolpad Core Vite app with React Router and authentication example](https://github.com/mui/toolpad/tree/master/examples/core/auth-vite/)
:::
