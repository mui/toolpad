# File structure

<p class="description">Toolpad's accessibility to the file-system makes it powerful. Let's learn how: </p>

Toolpad is file-system based, which means that an app's entire configuration is stored in files within your project. You can inspect and edit them from your IDE. You'll also use your own tools to author custom functions and components. This is how the project structure looks like in the file-system:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/file-structure/fresh.png", "alt": "Fresh Toolpad app", "caption": "File structure of a fresh Toolpad app with a single page", "indent": 1 }}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/file-structure/after.png", "alt": "Complex Toolpad app", "caption": "File structure of an app having 2 pages, 1 custom component and 1 function", "indent": 1 }}

You’ll notice there is a toolpad **folder** that contains these files. All files relevant to a Toolpad project are contained within this folder. Let's take a closer look at it:

- **components** contains your custom react components. These show in the component library in Toolpad and can be used to build UI.
- **pages** folder stores configuration(.yaml) of all pages of the app in separate folders. You can check a page file specification [schema](/toolpad/reference/file-schema/#file-Page). You'll notice it has a query object, it shows the configuration of HTTP request query. It can be edited directly from this file but in most cases, you’ll edit it from the visual query builder.
- **resources** stores .ts code of functions that were created using [custom function](/toolpad/concepts/custom-functions/).

Components and resources folders are created when you create your first custom component or function respectively.

Note: **.generated** folder contains build output of Toolpad. You shouldn't check this in your version control system and it contains all the artifacts required for Toolpad to run your application. This folder gets generated when you run `toolpad build` and needs to be present when you run `toolpad start`.
