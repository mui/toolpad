# Managing State

<p class="description">You can use bindings to make your components reactive to data on the page</p>

## Binding

### Binding button

Each property of component that may be bound to data present on the page is surrounded by a **Binding** button, which you can click to initiate data binding.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/binding-button.png", "alt": "Binding button", "caption": "The binding button", "zoom": false }}

### Binding editor

You can write JavaScript expressions in the editor which opens up.

The editor will expect a return type, for example `string`.

The **scope** includes the current values of all components and queries that you have added on the page. You can use anything from within this scope to write your JavaScript expressions.

The evaluated value of the binding will be visible to you in the editor.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/binding-editor.png", "alt": "Binding editor", "caption": "The binding editor" }}

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

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/managing-state/page-parameters-showcase.png", "alt": "Page parameters on runtime", "caption": "Runtime value passed in through a URL query parameter " }}
