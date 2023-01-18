declare const brand: unique symbol;

export interface Brand<B> {
  readonly [brand]: B;
}

// https://stackoverflow.com/a/56749647
export type Branded<A, B> = A & Brand<B>;
