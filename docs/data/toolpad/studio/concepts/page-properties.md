# Page properties

## Display mode

<p class="description">Toolpad Studio apps allow for a display mode configurable per-page.</p>

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/display-mode.png", "alt": "Display mode property ", "caption": "Display mode page property", "zoom": false, "width": 300 }}

### Options

The possible options for the the display mode are:

- **App shell**: Pages with their display mode set to this value will render within the navigation sidebar on the left, allowing for easy navigation between all pages.

To display a different name for a page in the sidebar, the page **display name** can be set.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/app-shell.png", "alt": "App shell display mode ", "caption": "Page with display mode set to App shell", "indent": 1 }}

- **No shell**: Pages with their display mode set to this value will render without the navigation sidebar.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/no-shell.png", "alt": "No shell display mode ", "caption": "Page with display mode set to No shell", "indent": 1}}

### Overrides

You can override this setting for any page using the `toolpad-display` query parameter with the page URL:

- `?toolpad-display=shell` - Same as App shell mode.
- `?toolpad-display=standalone` - Same as No shell mode.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/display-mode-override.png", "alt": "No shell display mode", "caption": "Overriding the display mode", "indent": 1}}

:::info
See the how-to guide on [how to embed Toolpad Studio pages](/toolpad/studio/how-to-guides/embed-pages/) using the display mode property.
:::

## Max width

Toolpad pages use a Material UI [Container](https://mui.com/material-ui/react-container/) as their top-level element. You can control the maximum width of this container in the page properties.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/page-properties/max-width.png", "alt": "Page container max width", "caption": "Setting the maximum width of the page container", "zoom": false, "width": 306}}

Available values are **xs**, **sm**, **md**, **lg**, **xl**, or **None** to conform to the available width in the window.

## Page parameters

Page parameters allow you to pass external data into the Toolpad Studio page state via the URL query parameters.

<video controls width="auto" height="100%" style="contain" alt="custom-component-creation">
  <source src="/static/toolpad/docs/studio/concepts/page-properties/page-parameter-1.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Setting parameters

You can set page parameters from the Page tab in the **Inspector panel** on right. You can add multiple parameters along with a default value for each.

### Using parameters

The parameters that you've added are available in the global scope for data bindings under the `page.parameters` variable.
The value that the parameter assumes at runtime is the value that is passed through a URL query parameter.

For example: if you define a page parameter `foo` and access the page with `?foo=123`, then the value of `page.parameters.foo` in the bindings will be `"123"`.

## Page alias

Pages are routed by their name. For example the page named **employees** will be accessible under the url **/pages/employees**.
In order to allow maintaining backwards compatibility when a page is renamed, one can define an alias for the page.
This can be done in its **page.yml** file.
Add a `alias` property to the file with an array of strings that you would like to use as aliases for the page. e.g.

```yaml
# /pages/employees/page.yml
apiVersion: v1
kind: page
spec:
  alias:
    - workers
    - colleagues
```

Now the urls **/pages/workers** and **/pages/colleagues** will both redirect to the url **/pages/employees**.
