import Scope from './Scope';

/**
 * Keeps track of imported modules and renders code to import them
 */
export default class Imports {
  // Maps imported modules to imported bindings
  imports = new Map<string, Map<string, string>>();

  scope: Scope;

  // Safeguard that makes sure we can't add any more imports after rendering
  sealed = false;

  constructor(scope: Scope) {
    this.scope = scope;
  }

  /**
   * Adds an import to the page module. Returns an identifier that's based on [suggestedName] that can
   * be used to reference the import.
   */
  add(
    source: string,
    imported: '*' | 'default' | string,
    suggestedName: string = imported,
  ): string {
    if (this.sealed) {
      throw new Error(`Can't add imports after they are sealed`);
    }

    let specifiers = this.imports.get(source);
    if (!specifiers) {
      specifiers = new Map();
      this.imports.set(source, specifiers);
    }

    const existing = specifiers.get(imported);
    if (existing) {
      return existing;
    }

    const localName = this.scope.createUniqueBinding(suggestedName);
    specifiers.set(imported, localName);
    return localName;
  }

  seal() {
    this.sealed = true;
  }

  render(): string {
    if (!this.sealed) {
      throw new Error('Seal imports before rendering them');
    }

    const aliasLines: string[] = [];

    const importLines = Array.from(this.imports.entries(), ([source, specifiers]) => {
      const renderedSpecifiers = [];
      const renderedNamedSpecifiers = [];
      const importAllName = specifiers.get('*');

      if (specifiers.size > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [imported, local] of specifiers.entries()) {
          if (imported === 'default') {
            renderedSpecifiers.push(local);
          } else if (imported !== '*') {
            renderedNamedSpecifiers.push(
              imported === local ? imported : [imported, local].join(importAllName ? ': ' : ' as '),
            );
          }
        }
      }

      if (importAllName) {
        renderedSpecifiers.push(`* as ${importAllName}`);
        if (renderedNamedSpecifiers.length > 0) {
          aliasLines.push(`const ${renderedNamedSpecifiers.join(', ')} = ${importAllName};`);
        }
      } else if (renderedNamedSpecifiers.length > 0) {
        renderedSpecifiers.push(`{ ${renderedNamedSpecifiers.join(', ')} }`);
      }

      return `import ${renderedSpecifiers.join(', ')} from '${source}';`;
    });

    return [...importLines, ...aliasLines].join('\n');
  }
}
