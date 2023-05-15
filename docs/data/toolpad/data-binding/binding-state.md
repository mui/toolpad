# Binding state

<p class="description">Data binding is a widely used concept inside Toolpad apps. It allows for connecting various parts of the application and making them react to data changes.</p>

## Binding button

In order to initiate data binding, look around in the UI for a binding button:

<img src="/static/toolpad/docs/data-binding/bind-1.png" alt="Binding icon" width="47" />

The easiest way to tell if a value can be "data bound" is by locating this binding button, i.e. the Text Field component allows you to bind every property that you could otherwise control manually.

<img src="/static/toolpad/docs/data-binding/bind-2.png" alt="Binding example" width="292" />

## Binding editor

Upon clicking a **binding button**, you will be presented with a binding editor dialog where you can write JavaScript expressions.

At the top of the editor you can see an explanation of what type of property we expect to be defined (i.e. above mentions string).

<img src="/static/toolpad/docs/data-binding/bind-3.png" alt="Binding editor" width="1190" />

On the left side of the editor there is a list of all the variables in the scope that can be used to define the expression.

You can either simply pass a path to a property of the object, or you can also use any other JavaScript expression or code snippet to additionally process the value that is going to be used.

<img src="/static/toolpad/docs/data-binding/bind-4.png" alt="Binding custom expression" width="1190" />

All that's left is to click **Update binding** and you can observe how application behaves.

(In this example you can see TextField value bound to the value of Typography component).

<!-- <img src="/static/toolpad/docs/data-binding/bind-16.gif" alt="Binding result" width="902px" // style="margin-bottom: 8px;" />
!-->

<video autoplay muted loop playsinline controls>
  <source src="/static/toolpad/docs/data-binding/bind-17.mp4" type="video/mp4">
</video>
