# Button

<p class="description">Guide to configure a button component in Toolpad.</p>

Buttons allow users to take actions, make choices with a single tap. Detailed documentation of the component properties is available in the reference section for [button](/toolpad/reference/components/button/#properties).

{{"component": "modules/components/button.js"}}

## Variations

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/components/button/variations.png", "alt": "Variations of button in Toolpad", "caption": "Variations of button in Toolpad", "indent": 1}}

## Usage

Button component supports an **onClick** event handler property. It is used to instruct what action to happen in the event of a click. It can perform actions like:

### Change component state

You can change the state on any component like:

<video controls width="100%" height="auto" style="contain" alt="button-onclick-js-expression">
  <source src="/static/toolpad/docs/components/button/onclick-js-expression.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Call backend code

You can run a backend function like:

<video controls width="100%" height="auto" style="contain" alt="button-onclick-run-code">
  <source src="/static/toolpad/docs/components/button/onclick-runcode.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

:::info
As shown above, Form component also has a button whose default action is submitting the form.
:::

### Navigate to page

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/components/button/onclick-navigation.png", "alt": "Navigating to a page on button click", "caption": "Navigating to a page on button click", "indent": 1}}
