export interface Comparator<T> {
  (a: T, b: T): number;
}

export function defaultComparator<T>(a: T, b: T): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export function alphabeticComparator(a: string, b: string): number {
  const { compare } = new Intl.Collator();
  return compare(a, b);
}

export function createPropComparator<T, K extends keyof T>(
  propName: K,
  comparator: Comparator<T[K]> = defaultComparator,
): Comparator<T> {
  return (a, b) => comparator(a[propName], b[propName]);
}
