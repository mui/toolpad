<!-- This file has been auto-generated. Do not modify manually. -->

# Image

<p class="description">API docs for the Toolpad Image component.</p>

The Image component lets you display images.

## Properties

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|`
| src | string |  | The url of the image. Must resolve to an image file. |
| alt | string | "" | The `alt` attribute holds a text description of the image. screen readers read this description out to their users so they know what the image means. Alt text is also displayed on the page if the image can't be loaded for some reason: for example, network errors, content blocking, or linkrot. |
| fit | string | "contain" | Defines how the image should [resize](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) to its container. |
| width | number | 400 | The image width in pixels |
| height | number | 300 |  |
| loading | boolean | false | Displays a loading animation indicating the image is still loading |
| sx | object |  | The [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/) is used for defining custom styles that have access to the theme. All MUI system properties are available via the `sx` prop. In addition, the `sx` prop allows you to specify any other CSS rules you may need. |