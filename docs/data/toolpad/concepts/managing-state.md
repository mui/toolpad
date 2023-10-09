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
