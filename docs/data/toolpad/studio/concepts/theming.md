# Theming

<p class="description">Toolpad Studio allows you to add your custom theme to your app, or customize individual component styles.</p>

## Adding a global theme

<video controls width="auto" height="100%" style="contain" alt="custom-component-creation">
  <source src="/static/toolpad/docs/studio/concepts/theming/theme-1.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

1. To change the application theme, go to the **Theme** tab in the inspector panel.
2. In the theme options you can:

   - change your UI to light or dark mode.
   - set primary and secondary colors for your UI, from a predefined list of colors.

3. The theme used in a project is configured by an auto-generated `theme.yml` file inside the `toolpad` folder. The [file schema documentation](/toolpad/studio/reference/file-schema/#file-Theme) contains detailed information on the supported options.

## Overrides

In order to provide a customised styling to the components used in your pages, you can use style overrides via the **sx** prop in the **Inspector.**

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/theming/theme-3.png", "alt": "Add sx prop", "caption": "Adding custom styles via the sx prop", "aspectRatio": 2.5 }}

Once you click on the `sx` prop, add style overrides in the JSON editor. Any value that is accepted by the MUI System [sx](https://mui.com/system/getting-started/the-sx-prop/) prop is acceptable here.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/concepts/theming/theme-4.png", "alt": "Add custom styles", "caption": "Styling the Image component" }}
