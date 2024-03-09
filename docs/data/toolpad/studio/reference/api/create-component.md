# createComponent

<p class="description">Build custom components and expose to Toolpad Studio.</p>

## Import

```jsx
import { createComponent } from '@toolpad/studio/browser';
```

## Description

By convention, Toolpad Studio custom components are placed inside of the `toolpad/components/` folder. Each file in this folder describes one custom Toolpad Studio component. As soon as the file exports a valid custom component in its default export it will be available in Toolpad Studio to be used in UI. The `createComponent` function attaches extra information to React components to signal to Toolpad Studio how they can be used and composed together.

```jsx
export default createComponent(MyComponent, config);
```

## Parameters

- `MyComponent` The React component to be made available to Toolpad Studio.

- `config` An object describing the capabilities of this component within Toolpad Studio. See [ComponentConfig](#componentconfig)

## Returns

A React component that will be available in the drag and drop editor with the defined `argTypes` as its properties.

## Types

### ComponentConfig

Describes the custom component.

**Properties**

| Name                   | Type                                   | Description                                                                                                                                                   |
| :--------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `helperText?`          | `string`                               | A short explanatory text that'll be shown in the editor UI when this component is referenced. May contain Markdown.                                           |
| `errorProp?`           | `string`                               | Designates a property as the error property. If Toolpad Studio detects an error on any of the inputs, it will forward it to this property.                    |
| `errorPropSource?`     | `string[]`                             | Configures which properties result in propagating error state to `errorProp`.                                                                                 |
| `loadingProp?`         | `string`                               | Designates a property as the loading property. If Toolpad Studio detects any of the inputs is still loading it will set this property to `true`.              |
| `loadingPropSource?`   | `string[]`                             | Configures which properties result in propagating loading state to `loadingProp`.                                                                             |
| `layoutDirection?`     | `'vertical' \| 'horizontal' \| 'both'` | Enables controlling the alignment of the component container box.                                                                                             |
| `resizableHeightProp?` | `string`                               | Designates a property as the resizable height property. If Toolpad Studio detects any vertical resizing of the component it will forward it to this property. |
| `argTypes?`            | `{ [name: string]: ArgumentType }`     | Describes the individual properties for this component. See [ArgumentType](#argumenttype).                                                                    |

### ArgumentType

Argument types describe the type and constraints of custom component properties. They are objects with a `type` property.

**properties**

| Name                | Type                                                                                             | Description                                                                                                                                                                                                            |
| :------------------ | :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type?`             | `'string' \| 'number' \| 'boolean' \| 'object' \| 'array' \| 'element' \| 'event' \| 'template'` | Describes the type of the property.                                                                                                                                                                                    |
| `default?`          | `any`                                                                                            | A default value for the property.                                                                                                                                                                                      |
| `helperText?`       | `string`                                                                                         | A short explanatory text that'll be shown in the editor UI when this property is referenced. May contain Markdown.                                                                                                     |
| `label?`            | `string`                                                                                         | To be used instead of the property name for UI purposes in the editor.                                                                                                                                                 |
| `description?`      | `string`                                                                                         | A description of the property, to be used to supply extra information to the user.                                                                                                                                     |
| `defaultValueProp?` | `string`                                                                                         | The property that will supply the default value.                                                                                                                                                                       |
| `onChangeProp?`     | `string`                                                                                         | The property that is used to control this property.                                                                                                                                                                    |
| `onChangeHandler?`  | `(...params: any[]) => any`                                                                      | Provides a way to manipulate the value from the onChange event before it is assigned to state.                                                                                                                         |
| `visible?`          | `boolean`                                                                                        | For compound components, this property is used to control the visibility of this property based on the selected value of another property. If this property is not defined, the property will be visible at all times. |
| `enum?`             | `string[]`                                                                                       | For the `'string'` type only. Defines a set of valid values for the property.                                                                                                                                          |
| `minimum?`          | `number`                                                                                         | For the `'number'` type only. Defines the minimum allowed value of the property.                                                                                                                                       |
| `maximum?`          | `number`                                                                                         | For the `'number'` type only. Defines the maximum allowed value of the property.                                                                                                                                       |

## Usage

:::info
See [custom components](/toolpad/studio/concepts/custom-components/)
:::
