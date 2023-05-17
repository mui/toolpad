# Event handling

<p class="description">Handle browser events in Toolpad.</p>

Some components have event handler props, such as the `Button` component and its `onClick` prop, which triggers when the button is clicked.

## JavaScript expression actions

Event handler props can be bound to run a piece of code to mutate the page state, through the use of JavaScript expressions.

In the example below, you can see how after clicking the button the value is copied from one component to the other:

<img src="/static/toolpad/docs/data-binding/bind-10.png" alt="Binding result 2" width="902px" style="margin-bottom: 8px;" />

After clicking the Button:

<img src="/static/toolpad/docs/data-binding/bind-11.png" alt="Binding result 2" width="200" />

## Navigation actions

In the binding editor for event handlers it is also possible to define **navigation actions**, which can open any page in the app when triggered.

You can set a navigation action in the **Navigation** tab of the binding editor for any event handler prop:

<img src="/static/toolpad/docs/data-binding/bind-12.png" alt="Binding editor for navigation actions" width="800" />

The binding editor for navigation actions allows you to select a page to go to, as well as set values for any [page parameters](/toolpad/building-ui/page-configuration/#page-parameters) that the destination page supports.

You can also bind the query parameter values to any page state of the origin page by clicking on the binding button near the respective parameter's input.
