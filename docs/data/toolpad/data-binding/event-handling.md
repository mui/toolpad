# Event handling

<p class="description">Handle browser events in Toolpad.</p>

Some components have event handler props, such as the `Button` component and its `onClick` prop, which triggers when the button is clicked.

## JavaScript expression actions

Event handler props can be bound to run a piece of code to mutate the page state, through the use of JavaScript expressions.

In the example below, you can see how after clicking the button the state of the text component changes:

<img src="/static/toolpad/docs/data-binding/bind-15.gif" alt="Binding result" width="902px" />

## Navigation actions

In the binding editor for event handlers it is also possible to define **navigation actions**, which can open any page in the app when triggered.

You can set a navigation action in the **Navigation** tab of the binding editor for any event handler prop:

<img src="/static/toolpad/docs/data-binding/bind-12.png" alt="Binding editor for navigation actions" width="800" />

<!---
@TODO: Link "any query string parameters that the destination page supports" to page parameters documentation
-->

The binding editor for navigation actions allows for:

- selecting a page to navigate to.
- set values for any query string parameters that the destination page supports.

It is also possible to bind the query parameter values to any page state of the origin page, by clicking on the binding button near the respective parameter's input.
