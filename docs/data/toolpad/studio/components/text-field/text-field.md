# Text Field

<p class="description">Learn about the textfield component and its usage in Toolpad Studio.</p>

## Demo

TextField is a text input component. It takes user input and provides the value for further usage on the page.

{{"demo": "TextFieldBasic.js", "hideToolbar": true}}

## Usage

It is one of the most used input component. The video below uses some props to demonstrate its usage.

<video controls width="100%" height="auto" alt="textfield">
  <source src="/static/toolpad/docs/studio/components/textfield/textfield.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### value

The current value.

### defaultValue

Allows setting a default value. In case user enters nothing, default value is used.

### password

Password prop masks the user input. It is used to hide sensitive data.

### name

A name is needed when a textfield is part of a form component. It is used to show validation errors.

## Appearance

The TextField component supports below mentioned appearance related props in Toolpad Studio:

### label

A label that describes the content of the textfield, for example "Enter name".

### variant

The variant property supports three different options: outlined (default), filled, and standard. Outlined is for low-emphasis while filled is a high-emphasis input. Standard is used for less-pronounced actions that ensure user remains focused on the main content.

{{"demo": "TextFieldVariant.js", "hideToolbar": true}}

### size

The size property supports two options: small (default) and medium.

{{"demo": "TextFieldSize.js", "hideToolbar": true}}

### fullWidth

This boolean defines if the component should take the full width of the page.

### placeholder

As shown in the first demo, in a blank text field, a placeholder shows up when the user starts typing.

### disabled

Disabled property shows the state of the component so that end user is aware that they can't interact with the component.

{{"demo": "TextFieldDisabled.js", "hideToolbar": true}}

## Validation

The validation props offer the option to create an interactive text field component for various scenarios. These are available as a checkbox configurations in the Toolpad Studio editor.

### isRequired

The `isRequired` prop is useful to display an error message when a value is not provided. It can be used for mandatory fields.

{{"demo": "TextFieldIsRequired.js", "hideToolbar": true}}

### minLength

Shows an error message according to the minimum required length for the provided text value. It can be used to ensure that a provided password is long enough, for example.

In the demo below, the input must be more than 6 characters long, otherwise a validation error is shown.

{{"demo": "TextFieldMinLength.js", "hideToolbar": true}}

### maxLength

Shows an error message according to the maximum required length for the provided text value. In combination with other props, it can be used to enforce the length of zip codes or phone numbers, for example.

In the demo below, the input must be no more than 6 characters long, otherwise a validation error is shown.

{{"demo": "TextFieldMaxLength.js", "hideToolbar": true}}

## API

See the documentation below for a complete reference to all props available to the textfield component in Toolpad Studio.

- [`<textfield />`](/toolpad/studio/reference/components/text-field/#properties)
