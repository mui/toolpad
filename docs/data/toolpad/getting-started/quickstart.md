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

<div class="arcade"><iframe src="https://demo.arcade.software/BhTsUpHyAYGApTZ2mFNj?embed" frameborder="0" loading="lazy" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;color-scheme: light;" title="Default page | Toolpad editor"></iframe></div>

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

1. Hover over the component library and drag a **Data Grid** component into the canvas. Now repeat the process and drag an **Image** component as well. When you're done, the canvas should look like this:

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-2.png" alt="Drag components"  />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">The Toolpad editor with components dragged</p>

### Fetch data

1. Click anywhere inside the canvas (except on the components that you just added) to deselect all components.

1. Locate the **Add query** button inside the inspector. Press it and choose **HTTP request**.

   <img src="/static/toolpad/docs/quickstart/step-3.png" alt="Choose HTTP request"  />

   <p class="image-caption">The Add query menu</p>

1. We'll be using the [dog API](https://dog.ceo/dog-api/) for this tutorial. First give the query a unique name: `dogQuery`. Then, set `https://dog.ceo/api/breeds/list/all` as the **URL**. Click the **Preview** button to inspect the result of this request, and expand the `message` object in the response. If all went well, it will look like this:

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-5.png" alt="Fetch URL"/>
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">The dog API response</p>

1. To transform the response according to our needs, we choose the **Transform** tab and enable the **Transform response** option. Write the JavaScript expression:

   ```js
   return Object.entries(data.message);
   ```

   in the editor. Click **Preview** again to verify the result.

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-6.png" alt="Transform response"   />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">The dog API data transformed</p>

### Bind data to UI

1. Save the query and close the query editor. Next, we will bind this data to components on the page. Click the **Data Grid** component to select it.

1. Find the **rows** property in the inspector. Notice that there's a small **Bind** button to its right. Properties with this button next to them can be bound to state available on the page:

   <img src="/static/toolpad/docs/quickstart/step-7.png" alt="Bind data" width="300"/>
   <p class="image-caption">The bindable rows property</p>

1. Click the button to open the binding editor. On the left you'll see a list of all bindable state in the page and on the right there's a code editor that accepts any JavaScript expression.

1. Use the `dogQuery` available in the scope as a binding expression.

   ```js
   dogQuery.data;
   ```

   save the binding and close the binding editor.

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-8.png" alt="dogQuery.data" />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">The binding editor</p>

1. If all went well, the Data Grid will now display the data from our query:

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-9.png" alt="Connected data/>
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">The Data Grid with bound data</p>

### Make the app interactive

1. Now, we can make this app interactive by displaying a random image of the selected breed. We'll create another query which reacts to the selection inside the Data Grid component. Deselect all components and click on **Add query** &rarr; **HTTP request**. Name it "imageQuery" and add a `breed` parameter in the **Parameters** section on the bottom:

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-10.png" alt="Breed parameter" />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">Editing imageQuery</p>

2. Click on the **Bind** button next to the breed parameter value, and add the following JavaScript expression in the binding editor:

   ```jsx
   dataGrid.selection?.[0] ?? 'akita';
   ```

   This will use the selected value from the Data Grid, and default to the "akita" breed when no row has been selected.

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-11.png" alt="Breed binding"  />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">Binding `breed` to the selected value</p>

3. Then bind the query **URL** to the following JavaScript expression:

   ```js
   `https://dog.ceo/api/breed/${parameters.breed}/images/random`;
   ```

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-12.png" alt="url binding"/>
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">Binding the URL to a JavaScript expression</p>

4. Save the binding and close the binding editor. Save the query and exit the query editor.

5. In the canvas select the **Image** component to view its properties in the inspector. Click on the **Bind** button next to the **src** prop to open the binding editor, and bind it to `imageQuery.data.message`.

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-13.png" alt="Bind image src to js" />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">Binding the Image src to the query response</p>

6. Try selecting different rows in the datagrid to see the image update to a random image of the selected breed.

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-14.png" alt="Preview image" />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">The image changing based on the selected row</p>

### Preview the app

1. Click on the **Preview** button to see a preview of what your app will look like when deployed:

   <div class="MuiToolpadDocs-ImageContainer" onClick="window.handleImageViewerOpen(event)">
      <img src="/static/toolpad/docs/quickstart/step-15.png" alt="Preview image" />
      <span class="MuiToolpadDocs-EnlargeIcon">    
      </span>
   </div>

   <p class="image-caption">The preview of our application</p>

2. That's it! Feel free to browse through the rest of the documentation to know more about what you can do with Toolpad.
