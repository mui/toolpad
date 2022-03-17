import { StudioComponentDefinition } from './studioComponentDefinition';
import { URI_SELECT_OPTIONS } from '../schemas';

export default {
  id: 'Select',
  displayName: 'Select',
  render(ctx, node, resolvedProps) {
    const FormControl = ctx.addImport('@mui/material', 'FormControl', 'FormControl');
    const InputLabel = ctx.addImport('@mui/material', 'InputLabel', 'InputLabel');
    const Select = ctx.addImport('@mui/material', 'Select', 'Select');
    const MenuItem = ctx.addImport('@mui/material', 'MenuItem', 'MenuItem');

    const { sx, label, options, ...props } = resolvedProps;

    // TODO: generate a unique id based on node name
    const labelId = 'my-select';

    return `
      <${FormControl} size="small" ${ctx.renderProps({ sx })}>
        <${InputLabel} id="${labelId}">${ctx.renderJsxContent(label)}</${InputLabel}>
        <${Select} 
          labelId="${labelId}" 
          label={${ctx.renderJsExpression(label)}} 
          ${ctx.renderProps(props)}
        >
          {${ctx.renderJsExpression(options)}.map((option) => (
            <${MenuItem} key={option.value} value={option.value}>
              {option.label ?? option.value}
            </${MenuItem}>
          )) ?? null}
        </${Select}>
      </${FormControl}>
    `;
  },
  argTypes: {
    label: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      defaultValue: '',
      defaultValueProp: 'defaultValue',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
    options: {
      typeDef: { type: 'array' },
      control: { type: 'json', schema: URI_SELECT_OPTIONS },
      defaultValue: [],
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as StudioComponentDefinition;
