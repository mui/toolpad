<!-- This file has been auto-generated using `pnpm docs:build:api`. -->

# Metric

<p class="description">API docs for the Toolpad Metric component.</p>

The Metric component can be used to display a single numerical value. it supports multiple numerical formats such as bytes, currency, percentage... It also supports conditional formatting to adapt the color based on the numerical value.

## Properties

| Name                                             | Type                                   | Default                                   | Description                                                      |
| :----------------------------------------------- | :------------------------------------- | :---------------------------------------- | :--------------------------------------------------------------- |
| <span class="prop-name">label</span>             | <span class="prop-type">string</span>  | <span class="prop-default">"label"</span> | The label to be displayed.                                       |
| <span class="prop-name">value</span>             | <span class="prop-type">number</span>  | <span class="prop-default">0</span>       | The value to be displayed.                                       |
| <span class="prop-name">numberFormat</span>      | <span class="prop-type">object</span>  |                                           | The number format for the value.                                 |
| <span class="prop-name">caption</span>           | <span class="prop-type">string</span>  | <span class="prop-default">""</span>      | The caption to be displayed.                                     |
| <span class="prop-name">conditionalFormat</span> | <span class="prop-type">object</span>  |                                           | The color of the number, dependent on the value.                 |
| <span class="prop-name">fullWidth</span>         | <span class="prop-type">boolean</span> |                                           | Whether the button should occupy all available horizontal space. |
