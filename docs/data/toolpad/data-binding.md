# Data binding

<p class="description">
    Data binding is a widely used concept inside Toolpad app which allows connecting various parts of the application and make them dynamically react to data changes.
</p>

## Binding button

In order to initiate data binding look around in the UI for a binding button.

![Binding icon](/static/toolpad/data-binding-1.png)

The easiest way to tell if a value can be "data bound" is by locating binding button, i.e. TextField component allows us to bind every property that we could otherwise control manually.

![Binding example](/static/toolpad/data-binding-2.png)

## Binding editor

Upon clicking **binding button** you will be presented with binding editor which allows you to define JavaScript expression.

At the top of the editor you can see an explanation what type of property we expect to be defined (i.e. above mentions string).

![Binding editor](/static/toolpad/data-binding-3.png)

On the left side of the editor you have a list of all the variables in the scope that can be used to define the expression.

You can either simply pass a path to a property of the object or you can also use any other JavaScript expression or code snippet to additionally process the value that is going to be used.

![Binding custom expression](/static/toolpad/data-binding-4x2.png)

All that's left is to click **UPDATE BINDING** and you can observe how application behaves.

(In this example you can see TextField value bound to the value of Typography component).

Empty field:

![Binding result 1](/static/toolpad/data-binding-5.png)

Field with value:

![Binding result 2](/static/toolpad/data-binding-6.png)

## Global scope variables

Sometimes you might want to define custom variables that could be used for data binding in order to do that you can use **EDIT PAGE MODULE** functionality that can be found in the **Inspector** on the right:

![Edit page module](/static/toolpad/data-binding-7.png)

You will be presented with an editor where you can define any number of variables:

![Global scope](/static/toolpad/data-binding-8.png)

Once you **SAVE** the changes you can use those variables to bind value of any property:

![Global variable in the editor](/static/toolpad/data-binding-9.png)
