# Canvas & Inspector

<p class="description">Canvas and Inspector are the two main areas when it comes to UI building.</p>

## Working with canvas

### Adding components

Drag the mouse over the component library to open the drawer.

<img src="/static/toolpad/docs/building-ui/ui-0a.png?v-0" alt="Open component drawer" />

Click on a component and drag it over the canvas.

<img src="/static/toolpad/docs/building-ui/ui-0b.png?v-0" alt="Drag a component" />

The canvas will highlight the location where a component can be dropped. Release the mouse to place the component on the canvas.

<img src="/static/toolpad/docs/building-ui/ui-0c.png?v-0" alt="Drop a component" />

### Selecting components

Click any component in the canvas to select it. An overlay indicates the selected components.

<img src="/static/toolpad/docs/building-ui/ui-2.png?v=0" width="230" alt="Canvas controls" />

### Moving components around

In order to change position of a component select it first then click on the overlay handle, drag and drop it in the new location. The canvas will highlight available drop location with green indicator.

<img src="/static/toolpad/docs/building-ui/ui-3.png?v-0" width="890" alt="Canvas controls" />

### Removing components

Select the component you want to remove. Click the bin icon in the overlay to remove it from the canvas. You can also press the <kbd class="key">Backspace</kbd> key to achieve the same result.

## Inspector

In the inspector panel you can see the values of the selected component's properties. Each component has a specific set of properties that you can tweak in the inspector panel.

<img src="/static/toolpad/docs/building-ui/ui-4.png?v=0" width="291" alt="Inspector" />

You can either use static or dynamic values as described in [data binding](/toolpad/data-binding/binding-state/) section

## Canvas grid

### Rows

Toolpad canvas uses a grid layout where you can use rows to position components:

<img src="/static/toolpad/docs/building-ui/ui-5.png?v=-0" width="405" alt="Canvas rows" />

### Columns

Or place them in a dedicated column besides other components:

<img src="/static/toolpad/docs/building-ui/ui-6.png?v=0" width="485" alt="Canvas rows" />

### Resizing components

Components placed in columns can be horizontally resized within the grid boundaries:

<img src="/static/toolpad/docs/building-ui/ui-7.png?v=0" width="480" alt="Canvas grid" />

## Custom styling

In order to provide a personalised styling to the components used in the application you can use style overrides via [sx](https://mui.com/system/getting-started/the-sx-prop/) prop.

<img src="/static/toolpad/docs/building-ui/ui-8.png?v-0" width="273" alt="SX" />

Click on **sx** button in the Inspector to bring up JSON editor and define style overrides:

<img src="/static/toolpad/docs/building-ui/ui-9.png?v-0" width="637" alt="SX" />
