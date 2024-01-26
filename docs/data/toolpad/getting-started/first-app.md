# Build your first app

<p class="description">Learn the fundamentals of building with Toolpad by creating a small application.</p>

This guide will walk you through the process of creating a small Toolpad application.
You'll use the MUI X Data Grid component to display a list of dog breeds from the [Dog API](https://dog.ceo/dog-api/).
When you click on the name of a breed, a random photo of the breed will be displayed using the Material UI Image component.

## Purpose

This guide is intended to introduce you to the fundamentals of building with Toolpad.
By the end, you should be able to:

- set up a new Toolpad app
- navigate through your workspace
- design a page and connect its data

## Prerequisites

Make sure to [install Node.js](https://nodejs.org/en) on your system.

## Building your first application

### Create a new app

1. Create a new application

   ```bash
   npx create-toolpad-app dog-app
   ```

1. Start the development server

   ```bash
   cd dog-app
   npm run dev
   ```

   The Toolpad application editor opens automatically in your browser.

   :::info
   Refer the [installation](/toolpad/getting-started/installation/) docs for more details on installing.
   :::

### Assemble the UI

1. Hover over the component library and drag a **Data Grid** component into the canvas. Now repeat the process and drag an **Image** component as well. When you're done, the canvas should look like this:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-1.png", "alt": "Toolpad editor", "caption": "The Toolpad editor with components dragged", "indent": 1  }}

### Fetch data

1. Locate the **+** (create new) button in the queries explorer. Press it and choose **REST API**.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-2.png", "alt":"Choose REST API", "caption":"The Add query menu", "zoom": false  }}

2. We'll be using the [dog API](https://dog.ceo/dog-api/) for this tutorial. Set

   ```html
   https://dog.ceo/api/breeds/list/all
   ```

   as the **URL**. Click the **Run** button to inspect the result of this request, and expand the `message` object in the response. If all went well, it will look like this:

{{"component": "modules/components/DocsImage.tsx", "src":"/static/toolpad/docs/getting-started/first-app/step-3.png", "alt": "Fetch URL", "caption": "The dog API response", "indent": 1  }}

3. To transform the response
   according to our needs, we choose the **Transform** tab and enable the **Transform
   response** option. Write the JavaScript expression:

   ```js
   return Object.entries(data.message);
   ```

   in the editor. Click **Run** again to verify the result.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-4.png", "alt": "Transform response", "caption": "The dog API response transformed", "indent": 1  }}

5. Click on **Save** to save the query, and then rename it to `dogQuery` by double clicking on it in the explorer.

### Bind data to UI

1. Next, we will bind this data to components on the page. Click the **Data Grid** component to select it.

1. Find the **rows** property in the inspector. Notice that there's a small **Bind** button to its right. Properties with this button next to them can be bound to state available on the page:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-5.png", "alt": "Bind data", "caption": "The bindable rows property", "zoom": false, "width": 300 }}

3. Click the button to open the binding editor. On the left you'll see a list of all bindable state in the page and on the right there's a code editor that accepts any JavaScript expression.

1. Use the `dogQuery` available in the scope as a binding expression.

   ```js
   dogQuery.data;
   ```

   save the binding and close the binding editor.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-6.png", "alt": "dogQuery.data", "caption": "The binding editor", "indent": 1  }}

5. If all went well, the Data Grid will now display the data from our query:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-7.png", "alt": "Connected data", "caption": "The data grid with bound data", "indent": 1  }}

### Make the app interactive

1. Now, we can make this app interactive by displaying a random image of the selected breed. We'll create another query which reacts to the selection inside the Data Grid component.

2. Create another query of the **REST API** type and add a `breed` parameter in the **Parameters** section on the right:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-8.png", "alt": "Breed parameter", "caption": "Editing imageQuery", "indent": 1  }}

2. Click on the **Bind** button next to the breed parameter value, and add the following JavaScript expression in the binding editor:

   <!-- prettier-ignore -->
   ```jsx
   dataGrid.selection?.[0] ?? 'akita'
   ```

   This will use the selected value from the Data Grid, and default to the "akita" breed when no row has been selected.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-9.png", "alt": "Breed binding", "caption": "Binding breed to the selected value", "indent": 1  }}

3. Then bind the query **URL** to the following JavaScript expression:

   <!-- prettier-ignore -->
   ```js
   `https://dog.ceo/api/breed/${parameters.breed}/images/random`
   ```

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-10.png", "alt": "URL binding", "caption": "Binding the URL to a JavaScript expression", "indent": 1 }}

4. Save the binding and close the binding editor. Save the query and exit the query editor.

5. Rename the query to `imageQuery` by double clicking on it in the queries explorer.

6. In the canvas select the **Image** component to view its properties in the inspector. Click on the **Bind** button next to the `src` prop to open the binding editor, and bind it to `imageQuery.data.message`.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-11.png", "alt": "Bind image src to Java", "caption": "Binding the Image src to the query response", "indent": 1  }}

6. Try selecting different rows in the data grid to see the image update to a random image of the selected breed.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-12.png", "alt": "Image changes based on selection", "caption": "The image changing based on the selected row", "indent": 1  }}

### Preview the app

1. Click on the **Preview** button to see a preview of what your app will look like when deployed:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/getting-started/first-app/step-13.png", "alt": "Preview of app", "caption": "The preview of our application", "indent": 1  }}

2. That's it! Feel free to browse through the rest of the documentation to know more about what you can do with Toolpad.
