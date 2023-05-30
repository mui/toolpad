# Quickstart

<p class="description">Learn the fundamentals of building with Toolpad by creating a small application.</p>

This guide will walk you through the process of creating a small Toolpad application.
You'll use the MUI X Data Grid component to display a list of dog breeds from the [Dog API](https://dog.ceo/dog-api/).
When you click on the name of a breed, a random photo of the breed will be displayed using the Material UI Image component.

## Purpose

This Quickstart guide is intended to introduce you to the fundamentals of building with Toolpad.
By the end, you should be able to:

- set up a new Toolpad app
- navigate through your workspace
- design a page and connect its data

## Prerequisites

Make sure to [install Node.js](https://nodejs.org/en) on your system.

## Building your first application

Interactive walkthrough of the app building process:

<div style="position: relative; padding-bottom: calc(54.79166666666667% + 41px); height: 0;"><iframe src="https://demo.arcade.software/BhTsUpHyAYGApTZ2mFNj?embed" frameborder="0" loading="lazy" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;color-scheme: light;" title="Default page | Toolpad editor"></iframe></div>

## Detailed steps

### Create a new app

1. Create a new application

   ```sh
   npx create-toolpad-app dog-app
   ```

1. Start the development server

   ```sh
   cd dog-app
   npm run dev
   ```

   The Toolpad application editor opens automatically in your browser.

### Assemble the UI

1. Hover over **Component library** and drag Data Grid component into **Canvas**. Now repeat the process and drag an Image component on the **Canvas** as well. When you're done, the canvas should look like:

   <img src="/static/toolpad/docs/quickstart/step-2.png" alt="Drag components" width="1512" />

   This will be the user interface of our application. Next we'll proceed with connecting it to backend data.

1. Click anywhere inside **Canvas** (except on the components that you just added) to deselect all components.

1. Locate **Add query** button inside **Inspector**

   <img src="/static/toolpad/docs/quickstart/step-3.png" alt="Add query" width="284" />

   Press the button and choose "HTTP request".

   <img src="/static/toolpad/docs/quickstart/step-3b.png" alt="Choose HTTP request" width="464" />

1. We'll be using the [open source dog API](https://dog.ceo/dog-api/) for our example. First give the query a name "dogQuery". The name must be unique in the page. Then set `https://dog.ceo/api/breeds/list/all` as the **URL**. The HTTP method can be left at GET. Click the preview button to inspect the result of this request. If all went well it should like like this:

   <img src="/static/toolpad/docs/quickstart/step-5.png?v=0" alt="Fetch URL"/>

1. APIs expose data in different shapes and forms. As you can see, this API returns an object containing a `message` property. This is not ideal for displaying in a datagrid. Luckily we can freely transform this data serverside. To do so choose the **Transform** tab and enable the **Transform response** option. Add the expression `return Object.entries(data.message)` in the editor. Click **Preview** again to verify the result.

   <img src="/static/toolpad/docs/quickstart/step-6.png?v=0" alt="Transform response" width="698" />

1. **Save** the query and close the editor to get back to the **Canvas**. The result of this HTTP request will now be available as state on the page. You'll learn how to bind the user interface to this state next.

1. Click the Data Grid component to select it.

1. Find the "rows" property in the **Inspector**. Notice there's a small link icon to the right of it. All bindable properties in Toolpad can be bound to state on the page. You can identify bindable properties by this link icon.

   <img src="/static/toolpad/docs/quickstart/step-7.png" alt="Bind data" width="295" />

   Click the icon to open the binding editor. On the left you'll see a list of all bindable state in the page, on the right there's a code editor that accepts any JavaScript expression. All bindable state is available in the scope of this expression.

1. Use a `dogQuery` variable available in the scope as a binding expression.

   ```js
   dogQuery.data;
   ```

   then click **Update binding**

   <img src="/static/toolpad/docs/quickstart/step-8.png?v=0" alt="dogQuery.data" width="1192" />

   If all went well, the DataGrid should now display the data from the HTTP request

   <img src="/static/toolpad/docs/quickstart/step-9.png" alt="Connected data" width="1512" />

1. Now let's make our app interactive by displaying a random image of the selected breed. We'll create a dynamic query which reacts to the selection inside Data Grid component. Click **Add query** and select "HTTP request" again. Name it "imageQuery" and add a parameter "breed"

   <img src="/static/toolpad/docs/quickstart/step-10.png" alt="Breed parameter" width="707" />

   Bind the breed parameter value to `dataGrid.selection?.[0] ?? 'akita'`. This will use the selected value from `dataGrid` and defaults to the "akita" breed when no row has been selected.

   <img src="/static/toolpad/docs/quickstart/step-11.png" alt="Breed binding" width="1191" />

   Then bind the query **URL** to

   ```js
   `https://dog.ceo/api/breed/${parameters.breed}/images/random`;
   ```

   <img src="/static/toolpad/docs/quickstart/step-12.png?v=0" alt="url binding" width="1191" />

   Click **Update binding** to exit the query editor.

1. In the **canvas** select the Image component and bind **src** prop to `imageQuery.data.message`. Try selecting different rows in the datagrid to see the image update to a random image of the selected breed.

   <img src="/static/toolpad/docs/quickstart/step-13.png" alt="Preview image" width="1511" />
