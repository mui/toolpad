# Data Grid

<p class="description">Features of a Data Grid component in Toolpad.</p>

Buttons allow users to take actions, make choices with a single tap. Detailed documentation of the component properties is available in the reference section for [button](/toolpad/reference/components/button/#properties).

{{"demo": "ButtonBasic.js", "hideToolbar": true}}

## Variations

The Button component has multiple variations supported in Toolpad. Let's look at each of these below:

### Variant

The variant property supports three different options: contained (default), outlined and text. Contained is a high-emphasis button suited for a primary action. Outlined is low-emphasis and for secondary action. Text is for less-pronounced actions to keep user focused on the main content.
{{"demo": "ButtonVariant.js", "hideToolbar": true}}

### Color

The color property has two options: primary (default) and secondary. These take input from the global theme that you set in Toolpad from the theme tab.
{{"demo": "ButtonColor.js", "hideToolbar": true}}

### Size

The size property supports three options: small (default), medium and large.
{{"demo": "ButtonSize.js", "hideToolbar": true}}

### State

The Button component supports different states like loading and disabled to better share the state of the component so that user can act accoridngly.
{{"demo": "ButtonState.js", "hideToolbar": true}}

## Usage

Button component supports an **onClick** event handler property. It is used to instruct what action to happen in the event of a click. It supports 2 tabs:

### JS Expression

You can write any valid JS that you want to execute on the click of button. It can change component state or call backend code.

<video controls width="100%" height="auto" style="contain" alt="button-onclick-js-expression">
  <source src="/static/toolpad/docs/components/button/button-usage.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Navigation

From this tab, you can move from one page to the other in a Toolpad app.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/components/button/onclick-navigation.png", "alt": "Navigating to a page on button click", "caption": "Navigating to a page on button click", "indent": 1}}

:::info
Form component also has a button whose default action is submitting the form.
:::
