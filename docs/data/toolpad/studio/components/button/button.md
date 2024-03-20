# Button

<p class="description">Learn about the button component and it's usage in Toolpad Studio.</p>

## Demo

Buttons allow users to take actions, make choices with a single tap.

{{"demo": "ButtonBasic.js", "hideToolbar": true}}

## Usage

Button component becomes usable through an **onClick** event handler property. It is used to instruct what action to happen in the event of a click. It supports two tabs:

### JS Expression

You can write any valid JavaScript that you want to execute on the click of button. It can change component state or call backend code.
Below video shows how on a button click, the user input can be shown on a page in a text field component:

<video controls width="100%" height="auto" style="contain" alt="button-onclick-js-expression">
  <source src="/static/toolpad/docs/studio/components/button/button-usage.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Navigation

From this tab, you can configure to move from one page to the other in a Toolpad Studio app.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/components/button/onclick-navigation.png", "alt": "Navigating to a page on button click", "caption": "Navigating to a page on button click", "indent": 1}}

:::info
Form component also has a button whose default action is submitting the form.
:::

## Appearance

The Button component has multiple variations supported in Toolpad Studio, which can be seen below.

### `variant`

The variant property supports three different options: contained (default), outlined and text. Contained is a high-emphasis button suited for a primary action. Outlined is for low-emphasis, secondary action. Text is used for less-pronounced actions that ensure user remains focused on the main content.
{{"demo": "ButtonVariant.js", "hideToolbar": true}}

### `color`

The color property has two options: primary (default) and secondary. These take input from the global theme that you set in Toolpad Studio from the theme tab.
{{"demo": "ButtonColor.js", "hideToolbar": true}}

### `size`

The size property supports three options: small (default), medium and large.
{{"demo": "ButtonSize.js", "hideToolbar": true}}

### State

Button supports states like loading and disabled to share the state of the component so that user can wait/act accoridngly.
{{"demo": "ButtonState.js", "hideToolbar": true}}

## API

See the documentation below for a complete reference to all props available to the button component in Toolpad Studio.

- [`<button />`](/toolpad/studio/reference/components/button/#properties)
