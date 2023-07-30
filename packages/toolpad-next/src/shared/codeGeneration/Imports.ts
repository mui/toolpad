import invariant from 'invariant';
import { Scope } from './Scope';
import { serializeArray } from './utils';

export default class Imports {
  private readonly imports = new Map<string, Map<string, string>>();

  constructor(private readonly scope: Scope) {
    invariant(scope.isGlobal(), 'Imports must be under a global scope');
  }

  addImport(id: string, importedName: string, localName: string): void {
    this.scope.allocate(localName);

    let idImports = this.imports.get(id);
    if (!idImports) {
      idImports = new Map();
      this.imports.set(id, idImports);
    }

    if (idImports.has(importedName)) {
      throw new Error(`Import ${importedName} already exists`);
    }

    idImports.set(importedName, localName);
  }

  useImport(id: string, importedName: string, localNameSuggestion: string = importedName): string {
    let idImports = this.imports.get(id);
    if (!idImports) {
      idImports = new Map();
      this.imports.set(id, idImports);
    }

    let localName = idImports.get(importedName);

    if (!localName) {
      localName = this.scope.generateUniqueName(localNameSuggestion);
      this.addImport(id, importedName, localName);
    }

    return localName;
  }

  print(): string {
    const importLines = [];

    for (const [id, idImports] of this.imports.entries()) {
      const namedImports = [];
      let defaultImport: string | undefined;
      for (const [importedName, localName] of idImports.entries()) {
        if (importedName === '*') {
          importLines.push(`import * as ${localName} from ${JSON.stringify(id)};`);
        } else if (importedName === 'default') {
          defaultImport = importedName;
        } else if (importedName === localName) {
          namedImports.push(importedName);
        } else {
          namedImports.push(`${importedName} as ${localName}`);
        }
      }

      const specifiers = [];

      if (defaultImport) {
        specifiers.push(defaultImport);
      }

      if (namedImports.length > 0) {
        specifiers.push(`{ ${namedImports.join(', ')} }`);
      }

      if (specifiers.length > 0) {
        importLines.push(`import ${specifiers.join(', ')} from ${JSON.stringify(id)};`);
      }
    }

    return importLines.join('\n');
  }

  printDynamicImports(): string {
    const serializedEntries = Array.from(this.imports.keys(), (name) =>
      serializeArray([JSON.stringify(name), `() => import(${JSON.stringify(name)})`]),
    );
    return serializeArray(serializedEntries);
  }
}
