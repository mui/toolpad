# Page configuration

<p class="description">Pages in Toolpad have several configuration options that can be customized.</p>

## Display mode

You can set a page's **display mode** in the inspector panel on the right side of the editor screen:

<img src="/static/toolpad/docs/building-ui/display-mode-1.png" alt="Page display mode selection" width="320" />

The possible values for the display mode are:

- **App shell** - Show app navigation sidebar on the left side of each page, allowing for easy navigation between all pages.
- **No shell** - Hide app navigation sidebar.

This display mode setting can be overriden by including the `toolpad-display` query parameter in the URL in the live application:

- `?toolpad-display=shell` - Show navigation sidebar.
- `?toolpad-display=standalone` - Hide navigation sidebar.

## Page parameters

It is possible to set **page parameters** for each page, which can hold values inside the scope of the page.

The value of page parameters can be controlled by including URL parameters with the same name in the live application.

To add page parameters, first click **Add page parameters** in the inspector panel:

<img src="/static/toolpad/docs/building-ui/page-parameters-1.png" alt="Page display mode selection" width="320" />

A dialog will show where you can set as many parameters as you wish by typing in their name and setting their default value:

<img src="/static/toolpad/docs/building-ui/page-parameters-2.png" alt="Page display mode selection" width="560" />

Page parameters can also be used in [data bindings](/toolpad/data-binding/) by accessing the `page.parameters` global variable.
