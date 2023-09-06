# File structure

<p class="description">Toolpad's accessibility to the file-system makes it powerful. Let's learn how: </p>

Toolpad’s full potential is harnessed when you run it alongside your local code editor. Toolpad is a local-first file-system based admin panel builder, which means an entire app is written down in config files (.yaml) and can be accessed through an IDE. Two main features of Toolpad; custom components and custom functions need IDE for you to write the code and use it in Toolpad. This is how an app looks in the file-system:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/file-structure/fresh.png", "alt": "Fresh Toolpad app", "caption": "File structure of a fresh Toolpad app with a single page", "indent": 1 }}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/file-structure/after.png", "alt": "Complex Toolpad app", "caption": "File structure of an app having 2 pages, 1 custom component and 1 function", "indent": 1 }}

If you’ll notice there is a Toolpad folder that contains these files. Outside of it, only necessary files exist that are needed for a Node.js project. Components and resources folders are created when you create your first custom component or function respectively.

Note: Configuration of an HTTP request is written inside the page.yml. In most cases, you’ll edit it from the visual query builder.
