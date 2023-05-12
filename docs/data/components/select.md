<!-- This file has been auto-generated. Do not modify manually. -->

# Select

<p class="description">API docs for the Toolpad Select component.</p>

The Select component lets you select a value from a set of options.

## Properties

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|`
| options | array | [] | The available options to select from. |
| value | string | "" | The currently selected value. |
| defaultValue | string | "" | A default value. |
| label | string | "" | A label that describes the option that can be selected. e.g. "Country". |
| name | string |  | Name of this element. Used as a reference in form data. |
| variant | string | "outlined" | One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard` |
| size | string | "small" | The size of the select. One of `small`, or `medium`. |
| fullWidth | boolean |  | Whether the select should occupy all available horizontal space. |
| disabled | boolean |  | Whether the select is disabled. |
| isRequired | boolean | false | Whether the select is required to have a value. |
| isInvalid | boolean | false | Whether the select value is invalid. |
| sx | object |  | The [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/) is used for defining custom styles that have access to the theme. All MUI system properties are available via the `sx` prop. In addition, the `sx` prop allows you to specify any other CSS rules you may need. |