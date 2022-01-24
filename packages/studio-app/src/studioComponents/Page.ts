import { StudioComponentDefinition } from '../types';

export default {
  id: 'Page',
  displayName: 'Page',
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
  render(ctx, props) {
    const Container = ctx.addImport('@mui/material', 'Container', 'Container');
    const Stack = ctx.addImport('@mui/material', 'Stack', 'Stack');

    const { children, ...other } = props;

    return `
      <${Container} ${ctx.renderProps(other)}>
        <${Stack} direction="column" gap={2} my={2}>
          ${ctx.renderJsxContent(children)}
        </${Stack}>
      </${Container}>
    `;
  },
} as StudioComponentDefinition;
