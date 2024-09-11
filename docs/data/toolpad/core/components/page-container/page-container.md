---
productId: toolpad-core
title: Page Container
components: PageContainer, PageContainerToolbar
---

# Page Container

<p class="description">A component that wraps page content and provides a title, breadcrumbs, and page actions.</p>

:::info
If this is your first time using Toolpad Core, you might want to start with the [base concepts](/docs/data/toolpad/core/introduction/base-concepts/) instead.
:::

`PageContent` is the ideal wrapper for the content of your dashboard. It shows the current page title, and provides breadcrumbs to navigate back into the current hierarchy. It makes your page responsive through the use of the Material&nbsp;UI Container component under the hood.

Just like [`DashboardLayout`](/toolpad/core/react-dashboard-layout/), `PageContainer` uses the navigation structure that is defined in the [`AppProvider`](/toolpad/core/react-app-provider/) to build up its breadcrumbs and title.

{{"demo": "BasicPageContainer.js", "height": 300}}

## Title and Breadcrumbs

The breacrumbs are formed by matching the current pathname with the navigation structure defined in the [`AppProvider`](/toolpad/core/react-app-provider/). The title of the matched segment is used as the page title. You can override the page title with the `title` property.

For example, under the following navigation structure:

```tsx
<AppProvider
  branding={{ title: 'ACME' }}
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

## Actions

You can configure additional actions in the area that is reserved on the right. To do so provide the `toolbar` slot to the `PageContainer` component. You can wrap the `PageContainerToolbar` component to create a custom toolbar component, as shown here:

{{"demo": "ActionsPageContainer.js", "height": 300}}

## Responsiveness

The Page Container component inherits the properties of the Material&nbsp;UI [Container](https://mui.com/material-ui/react-container/) component. You can use its `maxWidth` and `fixed` properties to control the bounds of the page.
