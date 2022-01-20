import { StudioComponentDefinition } from '../types';

export default {
  id: 'Select',
  displayName: 'Select',
  render(ctx, resolvedProps) {
    const FormControl = ctx.addImport('@mui/material', 'FormControl', 'FormControl');
    const InputLabel = ctx.addImport('@mui/material', 'InputLabel', 'InputLabel');
    const Select = ctx.addImport('@mui/material', 'Select', 'Select');

    const { label, value, options, ...props } = resolvedProps;

    // TODO: generate a unique id based on node name
    const labelId = 'my-select';

    return `
      <${FormControl} size="small">
        <${InputLabel} id="${labelId}">${ctx.renderJsxContent(label)}</${InputLabel}>
        <${Select} 
          value={${ctx.renderJsExpression(value)} || ''} 
          labelId="${labelId}" 
          label={${ctx.renderJsExpression(label)}} 
          ${ctx.renderProps(props)}
        >
          {${ctx.renderJsExpression(options)}?.split(',').map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
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
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
    options: {
      typeDef: { type: 'string' },
      // TODO: make this:
      // typeDef: { type: 'array', items: { type: 'string' } },
    },
  },
} as StudioComponentDefinition;
