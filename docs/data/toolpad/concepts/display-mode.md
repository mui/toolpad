# Display mode

<p class="description">Toolpad apps allow for a display mode configurable per-page.</p>

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/display-mode/display-mode.png", "alt": "Display mode property ", "caption": "Display mode page property", "zoom": false, "width": 300 }}

## Options

The possible options for the the display mode are:

- **App shell**: Pages with their display mode set to this value will render within the navigation sidebar on the left, allowing for easy navigation between all pages:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/display-mode/app-shell.png", "alt": "App shell display mode ", "caption": "Page with display mode set to App shell", "indent": 1 }}

- **No shell**: Pages with their display mode set to this value will render without the navigation sidebar

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/display-mode/no-shell.png", "alt": "No shell display mode ", "caption": "Page with display mode set to No shell", "indent": 1}}

## Overrides

You can override this setting for any page using the `toolpad-display` query parameter with the page URL:

- `?toolpad-display=shell` - Same as App shell mode.
- `?toolpad-display=standalone` - Same as No shell mode.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/concepts/display-mode/display-mode-override.png", "alt": "No shell display mode ", "caption": "Overriding the display mode", "indent": 1}}

:::info
See the how-to guide on [how to embed Toolpad pages](/toolpad/how-to-guides/embed-pages/) using the display mode property.
:::
