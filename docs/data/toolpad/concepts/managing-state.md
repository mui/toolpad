# Managing State

<p class="description">You can use bindings to make your components reactive to data on the page.</p>

## Binding

### Data binding

Each property of component that may be bound to data present on the page is surrounded by a **Binding** button, which you can click to initiate data binding.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/binding-button.png", "alt": "Binding button", "caption": "The binding button", "zoom": false, "width": 300 }}

You can write JavaScript expressions in the editor which opens up.

The editor will expect a return type, `string` for example.

The **scope** includes the current values of all components and queries that you have added on the page. You can use anything from within this scope to write your JavaScript expressions.

The evaluated value of the binding will be visible to you in the editor.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/binding-editor.png", "alt": "Binding editor", "caption": "The binding editor" }}

### JS expression actions

Some components have event handler props, such as the `Button` component and its `onClick` prop which triggers when the button is clicked.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/event-handling.png", "alt": "Event handling ", "caption": "Binding to event handler props"}}

You can run arbitrary JavaScript when the event fires, including manipulating the state of other components on the page.

:::info
See the [deleting data grid row](/toolpad/how-to-guides/delete-datagrid-row/) guide for a detailed usage example.
:::

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/on-click.gif", "alt": "onClick JavaScript ", "caption": "Running JavaScript on click", "indent": 1}}

### Navigation actions

It is also possible to navigate to a different page of the app when an event occurs.

The binding editor for navigation actions allows you to select which page to go to, as well as set values for any [page parameters](/toolpad/concepts/managing-state/#page-parameters) that the target page supports.

You may also bind the page parameter values to the page state of the source page.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/navigation-action.png", "alt": "onClick navigation ", "caption": "Navigation on click (1/2)", "indent": 1}}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/navigate.gif", "alt": "onClick navigation ", "caption": "Navigation on click (2/2)", "indent": 1, "aspectRatio": 2.5 }}

## Page parameters

Page parameters allow you to pass external data into the Toolpad page state via the URL query parameters.

### Setting parameters

You can set page parameters through the option to do so available in the **Inspector** when no component is selected.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/page-parameters.png", "alt": "Page parameters", "caption": "Page parameters" }}

In the editor, you can add multiple parameters along with a default value for each:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/add-page-params.png", "alt": "Page parameters", "caption": "Page parameters", "zoom": false }}

### Using parameters

The parameters that you add are made available in the **scope** for data binding under the `page.parameters` global variable.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/binding-page-params.png", "alt": "Using page parameters", "caption": "Using page parameters in bindings" }}

The value that the parameter assumes at runtime is the value that is passed in through a URL query parameter.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/page-parameters-showcase.png", "alt": "Page parameters on runtime", "caption": "Runtime value passed in through a URL query parameter ", "aspectRatio": 2.7 }}
