# Data binding

<p class="description">You can use bindings to make your components reactive to data on the page.</p>

Each property of component that may be bound to data present on the page is surrounded by a **Binding** button, which you can click to initiate data binding.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/data-binding/binding-button.png", "alt": "Binding button", "caption": "The binding button", "zoom": false, "width": 300 }}

You can write JavaScript expressions in the editor which opens up.

The editor will expect a return type, `string` for example.

The **scope** includes the current values of all components and queries that you have added on the page. You can use anything from within this scope to write your JavaScript expressions.

The evaluated value of the binding will be visible to you in the editor.

## Data binding patterns

### Data transformation

You can change the format of a value like:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/data-binding/data-transform.png", "alt": "Data transformation", "caption": "Data transformation", "zoom": false, "width": 300 }}

### Template strings

You can write template strings inside backticks (`) to write embedded expressions and multiline text. These are highly useful and can be used to read values from other components.

<video controls width="100%" height="auto" style="contain" alt="button-onclick-js-expression">
  <source src="/static/toolpad/docs/components/button/button-usage.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

:::info
Event handler props like onClick, runs the piece of code written in the binding editor. Read more on this in the [event handling](/toolpad/concepts/event-handling/) section.
:::
