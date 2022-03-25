import { RenderComponent } from './studioComponentDefinition';

export default function importedComponentRenderer(
  moduleName: string,
  importedName: string,
  suggestedLocalName: string = importedName,
): RenderComponent {
  return (ctx, node, resolvedProps) => {
    const localName = ctx.addImport(moduleName, importedName, suggestedLocalName);
    return `<${localName} ${ctx.renderProps(resolvedProps)} />`;
  };
}
