# Text Field

<p class="description">Learn about the textfield component and its usage in Toolpad Studio.</p>

## Demo

TextField is a text input component. It takes user input and provides the value for further usage on the page.

{{"demo": "TextFieldBasic.js", "hideToolbar": true}}

## Usage

It is one of the most used input component. The video below uses some props to demonstrate its usage.

<video controls width="100%" height="auto" style="contain" alt="textfield">
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

isRequired prop is useful when the action can't be perfomed without a user provided text value. It can be used to assign mandatory fields.

{{"demo": "TextFieldIsRequired.js", "hideToolbar": true}}

### minLength

A check on the minimum length of the input. In the below demo the input should be more than six characters long else it throws a validation error. It can be used to ensure passwords are long enough.

{{"demo": "TextFieldMinlength.js", "hideToolbar": true}}

### maxLength

A validation check on the maximum length of the input. The below demo shows a validation error when the input breaches the limit of ten characters. In combination with other props, it can be used for zip codes, phone numbers, etc.

{{"demo": "TextFieldMaxlength.js", "hideToolbar": true}}

## API

See the documentation below for a complete reference to all props available to the textfield component in Toolpad Studio.

- [`<textfield />`](/toolpad/studio/reference/components/text-field/#properties)
