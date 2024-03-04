# DatePicker

<p class="description">Learn about the datepicker component and its usage in Toolpad.</p>

## Demo

DatePicker is an input component. It takes user input and provides the value for further usage on the page.

{{"demo": "DatePicker.js", "hideToolbar": true}}

## Usage

Below props makes it usable:

### format

The [format](https://day.js.org/docs/en/display/format) of the date in the UI. The value for the bindings will always be in the YYYY-MM-DD format. Leave empty to let the end-user locale define the format.

{{"demo": "DatePickerFormat.js", "hideToolbar": true}}

### value

The current selected date. It shows the format in which it is being provided to the page: YYYY-MM-DD.

### defaultValue

Allows setting a default value. Example:

<video controls width="100%" height="auto" style="contain" alt="button-onclick-js-expression">
  <source src="/static/toolpad/docs/components/datepicker/datepicker-defaultValue.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### name

A name is needed when a textfield is part of a form component. It is used to show validation errors.

## Appearance

The DatePicker component supports below mentioned appearance related props in Toolpad:

### label

A label that describes the content of the datepicker e.g. Enter date.

### variant

The variant property supports three different options: outlined (default), filled, and standard. Outlined is for low-emphasis while Filled is a high-emphasis input. Standard is used for less-pronounced actions that ensure user remains focused on the main content.

{{"demo": "DatePickerVariant.js", "hideToolbar": true}}

### size

The size property supports two options: small (default) and medium.

{{"demo": "DatePickerSize.js", "hideToolbar": true}}

### fullWidth

This boolean defines if the component should take the full width of the page.

### disabled

Disabled property shows the state of the component so that end user is aware that can't interact with the component.

{{"demo": "DatePickerDisabled.js", "hideToolbar": true}}

## Validation

### isRequired

isRequired is useful when the action can't be perfomed without a user provided date.

<video controls width="100%" height="auto" style="contain" alt="button-onclick-js-expression">
  <source src="/static/toolpad/docs/components/datepicker/datepicker-validation.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## API

See the documentation below for a complete reference to all props available to the datepicker component in Toolpad.

- [`<datepicker />`](/toolpad/reference/components/date-picker/#properties)
