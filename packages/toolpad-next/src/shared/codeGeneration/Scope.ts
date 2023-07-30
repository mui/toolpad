import { isValidJsIdentifier } from '@mui/toolpad-utils/strings';

export class Scope {
  private readonly bindings = new Set<string>();

  constructor(private readonly parent?: Scope) {}

  generateUniqueName(base: string): string {
    let i = 1;
    let suggestion = base;
    while (this.has(suggestion)) {
      suggestion = `${base}_${i}`;
      i += 1;
    }
    return suggestion;
  }

  allocate(name: string): void {
    if (this.has(name)) {
      throw new Error(`Name ${name} is already allocated`);
    }
    if (!isValidJsIdentifier(name)) {
      throw new Error(`Name ${name} is not a valid JS identifier`);
    }
    this.bindings.add(name);
  }

  allocateSuggestion(base: string = '_v'): string {
    const name = this.generateUniqueName(base);
    this.allocate(name);
    return name;
  }

  has(key: string): boolean {
    if (key in this.bindings) {
      return true;
    }

    if (this.parent) {
      return this.parent.has(key);
    }

    return false;
  }

  fork(): Scope {
    return new Scope(this);
  }

  isGlobal(): boolean {
    return !this.parent;
  }
}
