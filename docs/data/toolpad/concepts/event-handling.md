# Event Handling

<p class="description">Actions create events and these events can be handled in multiple ways in Toolpad</p>

## JS expression actions

Some components have event handler props, such as the `Button` component and its `onClick` prop which triggers when the button is clicked.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/event-handling.png", "alt": "Event handling ", "caption": "Binding to event handler props"}}

You can run arbitrary JavaScript when the event fires, including manipulating the state of other components on the page.

:::info
See the [deleting data grid row](/toolpad/how-to-guides/delete-datagrid-row/) guide for a detailed usage example.
:::

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/on-click.gif", "alt": "onClick JavaScript ", "caption": "Running JavaScript on click", "indent": 1}}

## Navigation actions

It is also possible to navigate to a different page of the app when an event occurs.

The binding editor for navigation actions allows you to select which page to go to, as well as set values for any [page parameters](/toolpad/concepts/managing-state/#page-parameters) that the target page supports.

You may also bind the page parameter values to the page state of the source page.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/navigation-action.png", "alt": "onClick navigation ", "caption": "Navigation on click (1/2)", "indent": 1}}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/navigate.gif", "alt": "onClick navigation ", "caption": "Navigation on click (2/2)", "indent": 1, "aspectRatio": 2.5 }}
