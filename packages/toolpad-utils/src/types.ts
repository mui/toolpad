declare const brand: unique symbol;

export interface Brand<B> {
  readonly [brand]: B;
}

// https://stackoverflow.com/a/56749647
export type Branded<A, B> = A & Brand<B>;

// See https://github.com/microsoft/vscode/issues/94679#issuecomment-755194161
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type ExpandNested<T> = T extends infer O ? { [K in keyof O]: Expand<O[K]> } : never;

export {};

export interface AnyObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type StringToPath<StringPath extends string> = StringToPathC<StringPath>;

// ==============================
// Set
// ==============================
export type Set<
  Obj extends AnyObject,
  StringPath extends string,
  Value,
> = StringPath extends unknown ? SetC<Obj, StringToPath<StringPath>, Value> : never;

interface AnyArray extends ReadonlyArray<unknown>, AnyObject {}

type GetArrayValue<T extends readonly unknown[]> = T extends ReadonlyArray<infer U> ? U : never;

type IsTuple<T extends readonly unknown[]> = number extends T['length'] ? false : true;

type IsNumericKey<T extends string> = T extends `${number}` ? true : false;

type Standard<T extends string> = T extends `${infer L}[${infer M}]${infer R}`
  ? `${L}.${Standard<M>}${Standard<R>}`
  : T;

type StringToPathC<
  StringPath extends string,
  Path extends string[] = [],
> = Standard<StringPath> extends `${infer Key}.${infer Rest}`
  ? StringToPathC<Rest, AppendPath<Path, Key>>
  : AppendPath<Path, StringPath>;

type AppendPath<Path extends string[], Item extends string> = Item extends ''
  ? Path
  : [...Path, Item];

type SetC<Obj extends AnyObject, Path extends string[], Value, Index extends number = 0> = {
  0: Obj extends AnyArray // 1
    ? SetArray<Obj, Path, Value, Index>
    : {
        [K in keyof Obj | Path[Index]]: K extends Path[Index]
          ? SetC<GetNextObject<Obj[K], Path[Index]>, Path, Value, Index>
          : Obj[K];
      };
  1: Path['length'] extends 0 ? Obj : Value;
}[Index extends Path['length'] ? 1 : 0];

type GetNextObject<Value, NextKey extends string> = [Value] extends [never]
  ? DefaultObject<NextKey>
  : Value extends AnyObject
  ? Value
  : DefaultObject<NextKey>;

type DefaultObject<Key extends string> = IsNumericKey<Key> extends true ? [] : {};

type SetArray<
  Arr extends AnyArray,
  Path extends string[],
  Value,
  Index extends number,
> = IsNumericKey<Path[Index]> extends false
  ? Arr & SetC<{}, Path, Value, Index>
  : IsTuple<Arr> extends false
  ? (
      | GetArrayValue<Arr>
      | SetC<GetNextObject<GetArrayValue<Arr>, Path[Index]>, Path, Value, Index>
    )[]
  : SetTuple<
      Arr,
      Path[Index],
      SetC<GetNextObject<Arr[Path[Index]], Path[Index]>, Path, Value, Index>
    >;

type SetTuple<Arr extends AnyArray, Index extends string, Value> = SetTupleC<Arr, Index, Value>;

type SetTupleC<
  Arr extends AnyArray,
  Index extends string,
  Value,
  Result extends AnyArray = [],
  CurrentIndex extends number = Result['length'],
> = {
  0: SetTupleC<Arr, Index, Value, [...Result, Arr[CurrentIndex]]>;
  1: [...Result, Value, ...GetTupleRest<Arr, CurrentIndex>];
}[`${CurrentIndex}` extends Index ? 1 : 0];

type GetTupleRest<
  Tuple extends AnyArray,
  Index extends number,
  Keys extends string = GetTupleKeys<Tuple>,
> = `${Index}` extends Keys ? GetTupleRestC<Tuple, Index, Keys> : [];

type GetTupleRestC<
  Tuple extends AnyArray,
  Index extends number,
  Keys extends string,
  Result extends AnyArray = [],
> = Tuple['length'] extends Index // 2
  ? Result
  : GetTupleRestC<Tuple, Index, Keys, [...Result, Tuple[Index]]>;

type GetTupleKeys<Tuple extends AnyArray> = Extract<keyof Tuple, `${number}`>;
