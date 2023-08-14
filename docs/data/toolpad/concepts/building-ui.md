# Building UI

<p class="description">Toolpad allows you to build your frontends fast so you can concentrate on writing logic.</p>

## Component Library

In order to access a list of built in components, hover over the **Component library** vertical bar to make it expand:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/library.png", "alt": "Component library", "caption": "The Toolpad Component Library"  }}

Currently supported components:

- [Button](https://mui.com/material-ui/react-button/) - Use a button to capture user actions through a click.
- Image - Display different types of images.
- [DataGrid](https://mui.com/x/react-data-grid/) - Use the MUI X data grid component and easily render various types of tabular data.
- [Text Field](https://mui.com/material-ui/react-text-field/) - Capture text from user input.
- [Date Picker](https://mui.com/x/react-date-pickers/date-picker/) - Select a date from a date picker.
- File Picker - Select a file from the file system.
- [Text](https://mui.com/material-ui/react-typography/) - Present text content. Can be either plain text, markdow or links.
- [Select](https://mui.com/material-ui/react-select/) - Capture user input from a list of options.
- [Paper](https://mui.com/material-ui/react-paper/) - Provide a visual differantation for your components
- [Tabs](https://mui.com/material-ui/react-tabs/) - A tabs strip that can be used to shift between different views.
- [Container](https://mui.com/material-ui/react-container/) - A wrapper element that can be used to hide or show its children.
- List - An array of components presented as a repeating list.

We are working hard to add even more components. To make it easier for us to understand what should be added first, please help by [upvoting](https://github.com/mui/mui-toolpad/labels/waiting%20for%20%F0%9F%91%8D) components.

## Adding components

1. With the component library open, click on a component and drag it over the canvas.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-1.png", "alt": "Drag component", "caption": "Dragging a component to the canvas", "zoom": false  }}

2. The canvas will highlight the location where a component can be dropped. Release the mouse to place the component on the canvas.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-2.png", "alt": "Drop a component", "caption": "Placing a component on the canvas", "zoom": false  }}

## Selecting components

Click any component in the canvas to select it. An overlay indicates the selected components.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-3.png", "alt": "Drag component", "caption": "Selecting a component", "zoom": false  }}

## Moving components

In order to change position of a component, first you must select it. Then, click on the drag handler present in the overlay handle, drag it, and drop it at its new location. The canvas will highlight available drop locations with a blue indicator.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-4.gif", "alt": "Move component", "caption": "Moving a component", "aspectRatio": 2 }}

## Removing components

Select the component you want to remove. Click the bin icon in the overlay to remove it from the canvas. You can also press the <kbd class="key">Backspace</kbd> key to achieve the same result.

## Inspector

Each component has a specific set of properties that you can tweak in the inspector panel. This is available on the right side upon selecting a component.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-5.png", "alt": "Inspector panel", "caption": "Inspecting the data grid" }}

We'll talk about binding dynamic values to these properties in the [managing state](/toolpad/concepts/managing-state/) section.

## Canvas grid

### Rows

Toolpad canvas uses a grid layout where you can use rows to position components:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-6.png", "alt": "Canvas grid row", "caption": "Canvas grid rows", "zoom": false }}

### Columns

Or place them in a dedicated column besides other components:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-7.png", "alt": "Canvas grid columns", "caption": "Canvas grid columns", "zoom": false }}

### Resizing components

Components can be horizontally resized within the grid boundaries:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/building-ui/canvas-8.png", "alt": "Resize component", "caption": "Resizing components along columns", "zoom": false }}
