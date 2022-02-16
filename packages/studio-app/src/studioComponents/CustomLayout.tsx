import { StudioComponentDefinition } from './studioComponentDefinition';

export default {
  id: 'CustomLayout',
  displayName: 'CustomLayout',
  render(ctx, node, resolvedProps) {
    const Grid = ctx.addImport('@mui/material', 'Grid', 'Grid');
    const Placeholder = ctx.addImport('@mui/studio-core', 'Placeholder', 'Placeholder');

    const { child1, child2, child3 } = resolvedProps;

    return `
      <${Grid} container>
        <${Grid} item>
          <${Placeholder} prop="child1">${ctx.renderJsxContent(child1)}</${Placeholder}>
        </${Grid}>
        <${Grid} item>
          <${Placeholder} prop="child2">${ctx.renderJsxContent(child2)}</${Placeholder}>
        </${Grid}>
        <${Grid} item>${ctx.renderJsxContent(child3)}</${Grid}>
      </${Grid}>
    `;
  },
  argTypes: {
    child3: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
} as StudioComponentDefinition;
