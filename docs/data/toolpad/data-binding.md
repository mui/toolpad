# Data binding

<p class="description">Data binding is a widely used concept inside Toolpad apps. It allows connecting various parts of the application and make them react to data changes.</p>

## Binding button

In order to initiate data binding look around in the UI for a binding button:

<img src="/static/toolpad/docs/data-binding/bind-1.png" alt="Binding icon" width="47" />

The easiest way to tell if a value can be "data bound" is by locating binding button, i.e. Text Field component allows you to bind every property that you could otherwise control manually.

<img src="/static/toolpad/docs/data-binding/bind-2.png" alt="Binding example" width="292" />

## Binding editor

Upon clicking **binding button** you will be presented with binding editor which allows you to define JavaScript expression.

At the top of the editor you can see an explanation what type of property we expect to be defined (i.e. above mentions string).

<img src="/static/toolpad/docs/data-binding/bind-3.png" alt="Binding editor" width="1190" />

On the left side of the editor you have a list of all the variables in the scope that can be used to define the expression.

You can either simply pass a path to a property of the object or you can also use any other JavaScript expression or code snippet to additionally process the value that is going to be used.

<img src="/static/toolpad/docs/data-binding/bind-4.png" alt="Binding custom expression" width="1190" />

All that's left is to click **Update binding** and you can observe how application behaves.

(In this example you can see TextField value bound to the value of Typography component).

Empty field:

<img src="/static/toolpad/docs/data-binding/bind-5.png" alt="Binding result 1" width="905px" style="margin-bottom: 8px;" />

Field with value:

<img src="/static/toolpad/docs/data-binding/bind-6.png" alt="Binding result 2" width="902" />

## Event handling

Some components have event handler props, such as the Button component and its `onClick` prop. Event handler props can be bound to run a piece of code to mutate the page state.

In the example below you can see how after clicking the button, the value is copied from one component to the other:

<img src="/static/toolpad/docs/data-binding/bind-10.png" alt="Binding result 2" width="902px" style="margin-bottom: 8px;" />

After clicking the Button:

<img src="/static/toolpad/docs/data-binding/bind-11.png" alt="Binding result 2" width="200" />

### Navigation actions

In the binding editor for event handlers it is also possible to define **navigation actions**, which can open any page in your app when triggered.

You can set a navigation action in the **Navigation** tab of the binding editor for any event handler prop:

<img src="/static/toolpad/docs/data-binding/bind-12.png" alt="Binding editor for navigation actions" width="800" />

<!---
@TODO: Link "any query string parameters that the destination page supports" to page parameters documentation
-->

The binding editor for navigation actions allows you to select a page to go to, as well as set values for any query string parameters that the destination page supports.

You can also bind the query parameter values to any page state of the origin page by clicking on the binding button near the respective parameter's input.
