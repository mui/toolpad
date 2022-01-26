/**
 * Represents a javascript scope and helpers to create variable bindings in it.
 */
export default class Scope {
  parent: Scope | null = null;

  bindings = new Set<string>();

  constructor(parent: Scope | null = null) {
    this.parent = parent;
  }

  addBinding(binding: string): void {
    if (this.bindings.has(binding)) {
      throw new Error(`There's already a binding in scope for "${binding}"`);
    }
    this.bindings.add(binding);
  }

  hasBinding(binding: string): boolean {
    return this.bindings.has(binding) || (this.parent && this.parent.hasBinding(binding)) || false;
  }

  createUniqueBinding(suggestedName: string): string {
    let index = 1;
    let binding = /^\d/.test(suggestedName) ? `_${suggestedName}` : suggestedName;
    while (this.hasBinding(binding)) {
      binding = `${suggestedName}${index}`;
      index += 1;
    }
    this.addBinding(binding);
    return binding;
  }
}
