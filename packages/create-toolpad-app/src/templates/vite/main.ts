import { Template } from '../../types';

const mainTemplate: Template = (options) => {
  const { auth } = options;

  return `import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import OrdersPage from './pages/orders';
${auth ? `import SignInPage from './pages/signin';` : ''}

const router = createBrowserRouter([
  {
    Component: App,
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
      },${
        auth
          ? `
      {
        path: '/sign-in',
        Component: SignInPage,
      },`
          : ''
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);`;
};

export default mainTemplate;
