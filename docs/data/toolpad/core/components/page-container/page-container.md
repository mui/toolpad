---
productId: toolpad-core
title: Page Container
components: PageContainer, PageContainerToolbar
---

# Page Container

<p class="description">A component that wraps page container and provides title, breadcrumbs, page actions.</p>

The page container component is the ideal wrapper for your actual dashboard content. It shows the title of the current page and provides breadcrumbs to navigate back into the current hierarchy. It also provides a responsive [container](https://mui.com/material-ui/react-container/) for your page container.

Just like the Dashboard Layout component, the page container component uses the navigation structure that is defined in the app provider to build up its breadcrumbs and title.

{{"demo": "BasicPageContainer.js", "height": 300}}

## Title and Breadcrumbs

The breacrumbs are formed by matching the current pathname with the navigation structure in the App Layout. The title of the matched segment is used as the page title. You can override the page title with the `title` property.

## Actions

You can configure additional actions in the area that is reserved on the right. To do so provide the `toolbar` slot to the `PageContainer` component. You can wrap the `PageContainerToolbar` component.

{{"demo": "ActionsPageContainer.js", "height": 300}}

## Responsiveness

The Page Container component inherits the properties of the MUI [Container](https://mui.com/material-ui/react-container/) component. You can use its `maxWidth` and `fixed` properties to control the bounds of the page.
