# Building UI

<p class="description">Toolpad allows you to build your frontends fast so you can concentrate on writing logic.</p>

## Component Library

In order to access a list of built in components, hover over the **Component library** vertical bar to make it expand.

<video controls width="auto" height="100%" style="contain" alt="component-library">
  <source src="/static/toolpad/docs/concepts/building-ui/component-library.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

---

The list of built-in components available in Toolpad can be found [here](/toolpad/reference/components/) and we are always adding more. To make it easier for us to understand what should be added next, please help by [upvoting](https://github.com/mui/mui-toolpad/labels/waiting%20for%20%F0%9F%91%8D) components.

## Using components

1. Open the component library and drag a component over the canvas.
2. The canvas will highlight the location where the component can be dropped. Release the mouse to drop it.
3. To select a component, click on it either in the canvas or in the page hierarchy explorer. An overlay indicates the selected component.
4. To move a component, drag it from the drag handler present in the overlay and drop it at its new location. The canvas will highlight available drop locations with a blue indicator.
5. To delete a component, click the bin icon in the overlay. You can also press the <kbd class="key">Backspace</kbd> key while the component is selected.
6. Components can be horizontally resized within the grid boundaries:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-8.png", "alt": "Resize component", "caption": "Resizing components along columns", "zoom": false }}

Each component has a set of properties that you can tweak from the link button in the **inspector panel** on the right. The **page hierarchy explorer** on the bottom-left can be used to view the page structure, and select or rename components.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-1.png", "alt": "Toolpad panels", "caption": "Inspector panel and page hierarchy explorer" }}

Binding dynamic values to these properties is explained in the [managing state](/toolpad/concepts/managing-state/) section.

### Canvas grid

#### Rows

Toolpad canvas uses a grid layout where you can use rows to position components:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-6.png", "alt": "Canvas grid row", "caption": "Canvas grid rows", "zoom": false }}

#### Columns

Or place them in a dedicated column besides other components:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-7.png", "alt": "Canvas grid columns", "caption": "Canvas grid columns", "zoom": false }}
