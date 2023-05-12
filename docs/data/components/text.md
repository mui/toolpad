<!-- This file has been auto-generated. Do not modify manually. -->

# Text

<p class="description">API docs for the Toolpad Text component.</p>

The Text component lets you display text. Text can be rendered in multiple forms: plain, as a link, or as markdown.

## Properties

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|`
| mode | string | "text" | Defines how the content is rendered. Either as plain text, markdown, or as a link. |
| value | string | "text" | The text content. |
| href | string | "about:blank" | The url that is being linked. |
| variant | string | "body1" | The MUI typography [variant](https://mui.com/material-ui/customization/typography/#variants) that is used to display the text. |
| loading | boolean | false | Displays a loading animation instead of the text. Can be used when the content is not available yet. |
| sx | object |  | The [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/) is used for defining custom styles that have access to the theme. All MUI system properties are available via the `sx` prop. In addition, the `sx` prop allows you to specify any other CSS rules you may need. |