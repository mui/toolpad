# Event Handling

<p class="description">User actions create events that are handled in two ways in Toolpad Studio.</p>

## JS expression actions

Some components have event handler props, such as the `Button` component and its `onClick` prop which triggers when the button is clicked. You can run arbitrary JavaScript when the event fires, including manipulating the state of other components on the page.

Some event handling scenarios:

### Change component state

<video controls width="100%" height="auto" style="contain" alt="change-component-state">
  <source src="/static/toolpad/docs/studio/concepts/event-handling/change-component-state.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Call queries

You can call single or multiple queries sequentially to fetch data on the page or run an operation in the backend.

#### Single query

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/binding-editor.png", "alt": "Binding editor", "caption": "Fetch data from a query" }}

#### Multiple queries

<video controls width="100%" height="auto" style="contain" alt="call-multiple-queries">
  <source src="/static/toolpad/docs/studio/concepts/event-handling/multiple-queries.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

:::info
See the [deleting data grid row](/toolpad/studio/how-to-guides/delete-datagrid-row/) guide for a detailed usage example.
:::

### Using console options

Custom functions allow you to write custom code in your editor. You can write a `console.log` statement that interacts with the data on the page and prints logs.

<video controls width="100%" height="auto" style="contain" alt="console-log">
  <source src="/static/toolpad/docs/studio/concepts/event-handling/console-log.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Navigation actions

It is also possible to navigate to a different page of the app when an event occurs.

The binding editor for navigation actions allows you to select which page to go to, as well as set values for any [page parameters](/toolpad/studio/concepts/page-properties/#page-parameters) that the target page supports.

You may also bind the page parameter values to the page state of the source page.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/navigation-action.png", "alt": "onClick navigation ", "caption": "Navigation on click (1/2)", "indent": 1}}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/navigate.gif", "alt": "onClick navigation ", "caption": "Navigation on click (2/2)", "indent": 1, "aspectRatio": 2.5 }}
