import { StudioComponentDefinition } from './studioComponentDefinition';

export default {
  id: 'PageRow',
  displayName: 'PageRow',
  render(ctx, node, resolvedProps) {
    const Stack = ctx.addImport('@mui/material', 'Stack', 'Stack');

    const { children, ...props } = resolvedProps;

    return `
      <${Stack} direction="row" ${ctx.renderProps(props)}>
        ${ctx.renderJsxContent(children)}
      </${Stack}>
    `;
  },
  argTypes: {
    p: {
      typeDef: { type: 'number' },
      defaultValue: 2,
      label: 'padding',
    },
    gap: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
} as StudioComponentDefinition;
