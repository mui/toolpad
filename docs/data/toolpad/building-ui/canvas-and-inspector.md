# Canvas

<p class="description">
    Canvas and Inspector are the two main areas when it comes to UI building
</p>

## Working with canvas

To build your application's UI, drag the mouse over the component library to open the drawer. Select a component and drag it over the canvas. The canvas will highlight the location where a component can be dropped. Release the mouse to place the component in the canvas.

Once you have a few components on the canvas you can tweak them by doing following actions:

<img src="/static/toolpad/docs/canvas-controls.png" width="600px" alt="Canvas controls" />

- Select component - **click** on any component
- Changing component's order/placement on the canvas - initiate draggin by **clicking** on the component's hud when you see mouse cursor change to a hand icon
- Remove component from canvas - **click** bin icon in the component's hud

## Inspector

Upon component selection you can configure a set of predefined props (each component may have a different set of configurable props) in the inspector on the right side

<img src="/static/toolpad/docs/inspector.png" width="270px" alt="Inspector" />

You can either use a static values or use dynamic ones as described in [data binding](/toolpad/data-binding/) section

## Canvas grid

In order to make UI building more flexible you can use not only the row layout but add components side by side and use a different columns.

Additionally you can grab component on the side and resize it within the grid boundaries.

<img src="/static/toolpad/docs/canvas-grid.png" width="600px" alt="Canvas grid" />

## Custom styling

In order to provide a personalised styling to the components used in the application you can use style overrides via [sx](https://mui.com/system/getting-started/the-sx-prop/) prop.

<img src="/static/toolpad/docs/sx.png" width="270px" alt="SX" />

Click on **sx** button in the Inspector to bring up JSON editor and define style overrides:

<img src="/static/toolpad/docs/sx-editor.png" width="600px" alt="SX" />
