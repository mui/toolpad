---
productId: toolpad-core
title: Page Container
components: PageContainer, PageHeader, PageHeaderToolbar
---

# Page Container

<p class="description">A component that wraps page content and provides a title, breadcrumbs, and page actions.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

`PageContainer` is the ideal wrapper for the content of your dashboard. It shows the current page title, and provides breadcrumbs to navigate back into the current hierarchy. It makes your page responsive through the use of the Material&nbsp;UI Container component under the hood.

Just like [`DashboardLayout`](/toolpad/core/react-dashboard-layout/), `PageContainer` uses the navigation structure that is defined in the [`AppProvider`](/toolpad/core/react-app-provider/) to build up its breadcrumbs and title.

{{"demo": "BasicPageContainer.js", "height": 300}}

## Title and Breadcrumbs

The breadcrumbs are formed by matching the current pathname with the navigation structure defined in the [`AppProvider`](/toolpad/core/react-app-provider/). The title of the matched segment is used as the page title. You can override the page title with the `title` property.

For example, under the following navigation structure:

```tsx
<AppProvider
  navigation={[
    {
      segment: 'home',
      title: 'Home',
      children: [
        {
          segment: 'orders',
          title: 'Orders',
        },
      ],
    },
  ]}
>
  ...
</AppProvider>
```

The breadcrumbs contains **ACME / Home / Orders** when you visit the path **/home/orders**, and the page has a title of **Orders**.

{{"demo": "TitleBreadcrumbsPageContainer.js", "height": 300, "hideToolbar": true}}

## Dynamic routes

When you use the `PageContainer` on a dynamic route, you'll likely want to set a title and breadcrumbs belonging to the specific path. You can achieve this with the `title` and `breadcrumbs` property of the `PageContainer`

{{"demo": "CustomPageContainer.js", "height": 300}}

You can use the `useActivePage` hook to retrieve the title and breadcrumbs of the active page. This way you can extend the existing values.

```tsx
import { useActivePage } from '@toolpad/core/useActivePage';
import { Breadcrumb } from '@toolpad/core/PageContainer';

// Pass the id from your router of choice
function useDynamicBreadcrumbs(id: string): Breadcrumb[] {
  const activePage = useActivePage();
  invariant(activePage, 'No navigation match');

  const title = `Item ${id}`;
  const path = `${activePage.path}/${id}`;

  return [...activePage.breadcrumbs, { title, path }];
}
```

For example, under the Next.js App Router you would be able to obtain breadcrumbs for a dynamic route as follows:

```tsx
// ./src/app/example/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { PageContainer } from '@toolpad/core/PageContainer';
import invariant from 'invariant';
import { useActivePage } from '@toolpad/core/useActivePage';

export default function Example() {
  const params = useParams<{ id: string }>();
  const activePage = useActivePage();
  invariant(activePage, 'No navigation match');

  const title = `Item ${params.id}`;
  const path = `${activePage.path}/${params.id}`;

  const breadcrumbs = [...activePage.breadcrumbs, { title, path }];

  return (
    <PageContainer title={title} breadcrumbs={breadcrumbs}>
      ...
    </PageContainer>
  );
}
```

## Responsiveness

The Page Container component inherits the properties of the Material&nbsp;UI [Container](https://mui.com/material-ui/react-container/) component. You can use its [`maxWidth`](https://mui.com/material-ui/api/container/#container-prop-maxWidth) and [`fixed`](https://mui.com/material-ui/api/container/#container-prop-fixed) properties to control the bounds of the page. Set `maxWidth` to `false` to disable the container altogether and have the content bleed right up to the edges of the page.

## Standalone page header

The `PageHeader` component included in `PageContainer` can be imported and used by itself if you wish to do so, for more freedom of customization.

{{"demo": "PageContainerHeader.js", "height": 300}}

## Actions

You can configure additional actions in the area that is reserved on the right. To do so provide a custom `header` slot to the `PageContainer` component, where you can provide a custom `toolbar` slot to a `PageHeader`. You can wrap the `PageHeaderToolbar` component to create a custom toolbar component, as shown here:

{{"demo": "ActionsPageContainer.js", "height": 300}}

## Full-size content

The content inside the container can take up the full remaining available area with styles such as `flex: 1` or `height: 100%`.

{{"demo": "PageContainerFullScreen.js", "height": 400, "iframe": true}}
