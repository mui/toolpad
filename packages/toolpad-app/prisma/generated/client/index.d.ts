
/**
 * Client
**/

import * as runtime from './runtime/library';
type UnwrapPromise<P extends any> = P extends Promise<infer R> ? R : P
type UnwrapTuple<Tuple extends readonly unknown[]> = {
  [K in keyof Tuple]: K extends `${number}` ? Tuple[K] extends Prisma.PrismaPromise<infer X> ? X : UnwrapPromise<Tuple[K]> : UnwrapPromise<Tuple[K]>
};


/**
 * Model App
 * 
 */
export type App = {
  id: string
  name: string
  createdAt: Date
  editedAt: Date
  dom: Prisma.JsonValue | null
  public: boolean
}

/**
 * Model DomNode
 * 
 */
export type DomNode = {
  id: string
  name: string
  type: DomNodeType
  parentId: string | null
  parentIndex: string | null
  parentProp: string | null
  appId: string
}

/**
 * Model DomNodeAttribute
 * 
 */
export type DomNodeAttribute = {
  nodeId: string
  namespace: string
  name: string
  type: DomNodeAttributeType
  value: string
}

/**
 * Model Release
 * 
 */
export type Release = {
  description: string
  createdAt: Date
  snapshot: Buffer
  appId: string
  version: number
}

/**
 * Model Deployment
 * 
 */
export type Deployment = {
  id: string
  createdAt: Date
  appId: string
  version: number
}


/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const DomNodeAttributeType: {
  const: 'const',
  binding: 'binding',
  boundExpression: 'boundExpression',
  jsExpression: 'jsExpression',
  secret: 'secret',
  jsExpressionAction: 'jsExpressionAction',
  navigationAction: 'navigationAction'
};

export type DomNodeAttributeType = (typeof DomNodeAttributeType)[keyof typeof DomNodeAttributeType]


export const DomNodeType: {
  app: 'app',
  connection: 'connection',
  api: 'api',
  theme: 'theme',
  page: 'page',
  element: 'element',
  codeComponent: 'codeComponent',
  derivedState: 'derivedState',
  queryState: 'queryState',
  query: 'query',
  mutation: 'mutation'
};

export type DomNodeType = (typeof DomNodeType)[keyof typeof DomNodeType]


/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Apps
 * const apps = await prisma.app.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  GlobalReject extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined = 'rejectOnNotFound' extends keyof T
    ? T['rejectOnNotFound']
    : false
      > {
    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Apps
   * const apps = await prisma.app.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => Promise<void> : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): Promise<void>;

  /**
   * Add a middleware
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<this, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">) => Promise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<R>

      /**
   * `prisma.app`: Exposes CRUD operations for the **App** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Apps
    * const apps = await prisma.app.findMany()
    * ```
    */
  get app(): Prisma.AppDelegate<GlobalReject>;

  /**
   * `prisma.domNode`: Exposes CRUD operations for the **DomNode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DomNodes
    * const domNodes = await prisma.domNode.findMany()
    * ```
    */
  get domNode(): Prisma.DomNodeDelegate<GlobalReject>;

  /**
   * `prisma.domNodeAttribute`: Exposes CRUD operations for the **DomNodeAttribute** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DomNodeAttributes
    * const domNodeAttributes = await prisma.domNodeAttribute.findMany()
    * ```
    */
  get domNodeAttribute(): Prisma.DomNodeAttributeDelegate<GlobalReject>;

  /**
   * `prisma.release`: Exposes CRUD operations for the **Release** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Releases
    * const releases = await prisma.release.findMany()
    * ```
    */
  get release(): Prisma.ReleaseDelegate<GlobalReject>;

  /**
   * `prisma.deployment`: Exposes CRUD operations for the **Deployment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Deployments
    * const deployments = await prisma.deployment.findMany()
    * ```
    */
  get deployment(): Prisma.DeploymentDelegate<GlobalReject>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket


  /**
   * Prisma Client JS version: 4.11.0
   * Query Engine version: 8fde8fef4033376662cad983758335009d522acb
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }
  type HasSelect = {
    select: any
  }
  type HasInclude = {
    include: any
  }
  type CheckSelect<T, S, U> = T extends SelectAndInclude
    ? 'Please either choose `select` or `include`'
    : T extends HasSelect
    ? U
    : T extends HasInclude
    ? U
    : S

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  export function validator<V>(): <S>(select: runtime.Types.Utils.LegacyExact<S, V>) => S;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but with an array
   */
  type PickArray<T, K extends Array<keyof T>> = Prisma__Pick<T, TupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    App: 'App',
    DomNode: 'DomNode',
    DomNodeAttribute: 'DomNodeAttribute',
    Release: 'Release',
    Deployment: 'Deployment'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  export type DefaultPrismaClient = PrismaClient
  export type RejectOnNotFound = boolean | ((error: Error) => Error)
  export type RejectPerModel = { [P in ModelName]?: RejectOnNotFound }
  export type RejectPerOperation =  { [P in "findUnique" | "findFirst"]?: RejectPerModel | RejectOnNotFound } 
  type IsReject<T> = T extends true ? True : T extends (err: Error) => Error ? True : False
  export type HasReject<
    GlobalRejectSettings extends Prisma.PrismaClientOptions['rejectOnNotFound'],
    LocalRejectSettings,
    Action extends PrismaAction,
    Model extends ModelName
  > = LocalRejectSettings extends RejectOnNotFound
    ? IsReject<LocalRejectSettings>
    : GlobalRejectSettings extends RejectPerOperation
    ? Action extends keyof GlobalRejectSettings
      ? GlobalRejectSettings[Action] extends RejectOnNotFound
        ? IsReject<GlobalRejectSettings[Action]>
        : GlobalRejectSettings[Action] extends RejectPerModel
        ? Model extends keyof GlobalRejectSettings[Action]
          ? IsReject<GlobalRejectSettings[Action][Model]>
          : False
        : False
      : False
    : IsReject<GlobalRejectSettings>
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

  export interface PrismaClientOptions {
    /**
     * Configure findUnique/findFirst to throw an error if the query returns null. 
     * @deprecated since 4.0.0. Use `findUniqueOrThrow`/`findFirstOrThrow` methods instead.
     * @example
     * ```
     * // Reject on both findUnique/findFirst
     * rejectOnNotFound: true
     * // Reject only on findFirst with a custom error
     * rejectOnNotFound: { findFirst: (err) => new Error("Custom Error")}
     * // Reject on user.findUnique with a custom error
     * rejectOnNotFound: { findUnique: {User: (err) => new Error("User not found")}}
     * ```
     */
    rejectOnNotFound?: RejectOnNotFound | RejectPerOperation
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources

    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat

    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findMany'
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => Promise<T>,
  ) => Promise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AppCountOutputType
   */


  export type AppCountOutputType = {
    deployments: number
    nodes: number
    releases: number
  }

  export type AppCountOutputTypeSelect = {
    deployments?: boolean
    nodes?: boolean
    releases?: boolean
  }

  export type AppCountOutputTypeGetPayload<S extends boolean | null | undefined | AppCountOutputTypeArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? AppCountOutputType :
    S extends undefined ? never :
    S extends { include: any } & (AppCountOutputTypeArgs)
    ? AppCountOutputType 
    : S extends { select: any } & (AppCountOutputTypeArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof AppCountOutputType ? AppCountOutputType[P] : never
  } 
      : AppCountOutputType




  // Custom InputTypes

  /**
   * AppCountOutputType without action
   */
  export type AppCountOutputTypeArgs = {
    /**
     * Select specific fields to fetch from the AppCountOutputType
     */
    select?: AppCountOutputTypeSelect | null
  }



  /**
   * Count Type DomNodeCountOutputType
   */


  export type DomNodeCountOutputType = {
    children: number
    attributes: number
  }

  export type DomNodeCountOutputTypeSelect = {
    children?: boolean
    attributes?: boolean
  }

  export type DomNodeCountOutputTypeGetPayload<S extends boolean | null | undefined | DomNodeCountOutputTypeArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? DomNodeCountOutputType :
    S extends undefined ? never :
    S extends { include: any } & (DomNodeCountOutputTypeArgs)
    ? DomNodeCountOutputType 
    : S extends { select: any } & (DomNodeCountOutputTypeArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof DomNodeCountOutputType ? DomNodeCountOutputType[P] : never
  } 
      : DomNodeCountOutputType




  // Custom InputTypes

  /**
   * DomNodeCountOutputType without action
   */
  export type DomNodeCountOutputTypeArgs = {
    /**
     * Select specific fields to fetch from the DomNodeCountOutputType
     */
    select?: DomNodeCountOutputTypeSelect | null
  }



  /**
   * Count Type ReleaseCountOutputType
   */


  export type ReleaseCountOutputType = {
    deployments: number
  }

  export type ReleaseCountOutputTypeSelect = {
    deployments?: boolean
  }

  export type ReleaseCountOutputTypeGetPayload<S extends boolean | null | undefined | ReleaseCountOutputTypeArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? ReleaseCountOutputType :
    S extends undefined ? never :
    S extends { include: any } & (ReleaseCountOutputTypeArgs)
    ? ReleaseCountOutputType 
    : S extends { select: any } & (ReleaseCountOutputTypeArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof ReleaseCountOutputType ? ReleaseCountOutputType[P] : never
  } 
      : ReleaseCountOutputType




  // Custom InputTypes

  /**
   * ReleaseCountOutputType without action
   */
  export type ReleaseCountOutputTypeArgs = {
    /**
     * Select specific fields to fetch from the ReleaseCountOutputType
     */
    select?: ReleaseCountOutputTypeSelect | null
  }



  /**
   * Models
   */

  /**
   * Model App
   */


  export type AggregateApp = {
    _count: AppCountAggregateOutputType | null
    _min: AppMinAggregateOutputType | null
    _max: AppMaxAggregateOutputType | null
  }

  export type AppMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    editedAt: Date | null
    public: boolean | null
  }

  export type AppMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    editedAt: Date | null
    public: boolean | null
  }

  export type AppCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    editedAt: number
    dom: number
    public: number
    _all: number
  }


  export type AppMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    editedAt?: true
    public?: true
  }

  export type AppMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    editedAt?: true
    public?: true
  }

  export type AppCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    editedAt?: true
    dom?: true
    public?: true
    _all?: true
  }

  export type AppAggregateArgs = {
    /**
     * Filter which App to aggregate.
     */
    where?: AppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apps to fetch.
     */
    orderBy?: Enumerable<AppOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Apps
    **/
    _count?: true | AppCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppMaxAggregateInputType
  }

  export type GetAppAggregateType<T extends AppAggregateArgs> = {
        [P in keyof T & keyof AggregateApp]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApp[P]>
      : GetScalarType<T[P], AggregateApp[P]>
  }




  export type AppGroupByArgs = {
    where?: AppWhereInput
    orderBy?: Enumerable<AppOrderByWithAggregationInput>
    by: AppScalarFieldEnum[]
    having?: AppScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppCountAggregateInputType | true
    _min?: AppMinAggregateInputType
    _max?: AppMaxAggregateInputType
  }


  export type AppGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    editedAt: Date
    dom: JsonValue | null
    public: boolean
    _count: AppCountAggregateOutputType | null
    _min: AppMinAggregateOutputType | null
    _max: AppMaxAggregateOutputType | null
  }

  type GetAppGroupByPayload<T extends AppGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<AppGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppGroupByOutputType[P]>
            : GetScalarType<T[P], AppGroupByOutputType[P]>
        }
      >
    >


  export type AppSelect = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    editedAt?: boolean
    dom?: boolean
    public?: boolean
    deployments?: boolean | App$deploymentsArgs
    nodes?: boolean | App$nodesArgs
    releases?: boolean | App$releasesArgs
    _count?: boolean | AppCountOutputTypeArgs
  }


  export type AppInclude = {
    deployments?: boolean | App$deploymentsArgs
    nodes?: boolean | App$nodesArgs
    releases?: boolean | App$releasesArgs
    _count?: boolean | AppCountOutputTypeArgs
  }

  export type AppGetPayload<S extends boolean | null | undefined | AppArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? App :
    S extends undefined ? never :
    S extends { include: any } & (AppArgs | AppFindManyArgs)
    ? App  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'deployments' ? Array < DeploymentGetPayload<S['include'][P]>>  :
        P extends 'nodes' ? Array < DomNodeGetPayload<S['include'][P]>>  :
        P extends 'releases' ? Array < ReleaseGetPayload<S['include'][P]>>  :
        P extends '_count' ? AppCountOutputTypeGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (AppArgs | AppFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'deployments' ? Array < DeploymentGetPayload<S['select'][P]>>  :
        P extends 'nodes' ? Array < DomNodeGetPayload<S['select'][P]>>  :
        P extends 'releases' ? Array < ReleaseGetPayload<S['select'][P]>>  :
        P extends '_count' ? AppCountOutputTypeGetPayload<S['select'][P]> :  P extends keyof App ? App[P] : never
  } 
      : App


  type AppCountArgs = 
    Omit<AppFindManyArgs, 'select' | 'include'> & {
      select?: AppCountAggregateInputType | true
    }

  export interface AppDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one App that matches the filter.
     * @param {AppFindUniqueArgs} args - Arguments to find a App
     * @example
     * // Get one App
     * const app = await prisma.app.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AppFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AppFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'App'> extends True ? Prisma__AppClient<AppGetPayload<T>> : Prisma__AppClient<AppGetPayload<T> | null, null>

    /**
     * Find one App that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AppFindUniqueOrThrowArgs} args - Arguments to find a App
     * @example
     * // Get one App
     * const app = await prisma.app.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AppFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, AppFindUniqueOrThrowArgs>
    ): Prisma__AppClient<AppGetPayload<T>>

    /**
     * Find the first App that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppFindFirstArgs} args - Arguments to find a App
     * @example
     * // Get one App
     * const app = await prisma.app.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AppFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AppFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'App'> extends True ? Prisma__AppClient<AppGetPayload<T>> : Prisma__AppClient<AppGetPayload<T> | null, null>

    /**
     * Find the first App that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppFindFirstOrThrowArgs} args - Arguments to find a App
     * @example
     * // Get one App
     * const app = await prisma.app.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AppFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AppFindFirstOrThrowArgs>
    ): Prisma__AppClient<AppGetPayload<T>>

    /**
     * Find zero or more Apps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Apps
     * const apps = await prisma.app.findMany()
     * 
     * // Get first 10 Apps
     * const apps = await prisma.app.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appWithIdOnly = await prisma.app.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AppFindManyArgs>(
      args?: SelectSubset<T, AppFindManyArgs>
    ): Prisma.PrismaPromise<Array<AppGetPayload<T>>>

    /**
     * Create a App.
     * @param {AppCreateArgs} args - Arguments to create a App.
     * @example
     * // Create one App
     * const App = await prisma.app.create({
     *   data: {
     *     // ... data to create a App
     *   }
     * })
     * 
    **/
    create<T extends AppCreateArgs>(
      args: SelectSubset<T, AppCreateArgs>
    ): Prisma__AppClient<AppGetPayload<T>>

    /**
     * Create many Apps.
     *     @param {AppCreateManyArgs} args - Arguments to create many Apps.
     *     @example
     *     // Create many Apps
     *     const app = await prisma.app.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends AppCreateManyArgs>(
      args?: SelectSubset<T, AppCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a App.
     * @param {AppDeleteArgs} args - Arguments to delete one App.
     * @example
     * // Delete one App
     * const App = await prisma.app.delete({
     *   where: {
     *     // ... filter to delete one App
     *   }
     * })
     * 
    **/
    delete<T extends AppDeleteArgs>(
      args: SelectSubset<T, AppDeleteArgs>
    ): Prisma__AppClient<AppGetPayload<T>>

    /**
     * Update one App.
     * @param {AppUpdateArgs} args - Arguments to update one App.
     * @example
     * // Update one App
     * const app = await prisma.app.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AppUpdateArgs>(
      args: SelectSubset<T, AppUpdateArgs>
    ): Prisma__AppClient<AppGetPayload<T>>

    /**
     * Delete zero or more Apps.
     * @param {AppDeleteManyArgs} args - Arguments to filter Apps to delete.
     * @example
     * // Delete a few Apps
     * const { count } = await prisma.app.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AppDeleteManyArgs>(
      args?: SelectSubset<T, AppDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Apps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Apps
     * const app = await prisma.app.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AppUpdateManyArgs>(
      args: SelectSubset<T, AppUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one App.
     * @param {AppUpsertArgs} args - Arguments to update or create a App.
     * @example
     * // Update or create a App
     * const app = await prisma.app.upsert({
     *   create: {
     *     // ... data to create a App
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the App we want to update
     *   }
     * })
    **/
    upsert<T extends AppUpsertArgs>(
      args: SelectSubset<T, AppUpsertArgs>
    ): Prisma__AppClient<AppGetPayload<T>>

    /**
     * Count the number of Apps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppCountArgs} args - Arguments to filter Apps to count.
     * @example
     * // Count the number of Apps
     * const count = await prisma.app.count({
     *   where: {
     *     // ... the filter for the Apps we want to count
     *   }
     * })
    **/
    count<T extends AppCountArgs>(
      args?: Subset<T, AppCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a App.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppAggregateArgs>(args: Subset<T, AppAggregateArgs>): Prisma.PrismaPromise<GetAppAggregateType<T>>

    /**
     * Group by App.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppGroupByArgs['orderBy'] }
        : { orderBy?: AppGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for App.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AppClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    deployments<T extends App$deploymentsArgs= {}>(args?: Subset<T, App$deploymentsArgs>): Prisma.PrismaPromise<Array<DeploymentGetPayload<T>>| Null>;

    nodes<T extends App$nodesArgs= {}>(args?: Subset<T, App$nodesArgs>): Prisma.PrismaPromise<Array<DomNodeGetPayload<T>>| Null>;

    releases<T extends App$releasesArgs= {}>(args?: Subset<T, App$releasesArgs>): Prisma.PrismaPromise<Array<ReleaseGetPayload<T>>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * App base type for findUnique actions
   */
  export type AppFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * Filter, which App to fetch.
     */
    where: AppWhereUniqueInput
  }

  /**
   * App findUnique
   */
  export interface AppFindUniqueArgs extends AppFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * App findUniqueOrThrow
   */
  export type AppFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * Filter, which App to fetch.
     */
    where: AppWhereUniqueInput
  }


  /**
   * App base type for findFirst actions
   */
  export type AppFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * Filter, which App to fetch.
     */
    where?: AppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apps to fetch.
     */
    orderBy?: Enumerable<AppOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Apps.
     */
    cursor?: AppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Apps.
     */
    distinct?: Enumerable<AppScalarFieldEnum>
  }

  /**
   * App findFirst
   */
  export interface AppFindFirstArgs extends AppFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * App findFirstOrThrow
   */
  export type AppFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * Filter, which App to fetch.
     */
    where?: AppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apps to fetch.
     */
    orderBy?: Enumerable<AppOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Apps.
     */
    cursor?: AppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Apps.
     */
    distinct?: Enumerable<AppScalarFieldEnum>
  }


  /**
   * App findMany
   */
  export type AppFindManyArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * Filter, which Apps to fetch.
     */
    where?: AppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apps to fetch.
     */
    orderBy?: Enumerable<AppOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Apps.
     */
    cursor?: AppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apps.
     */
    skip?: number
    distinct?: Enumerable<AppScalarFieldEnum>
  }


  /**
   * App create
   */
  export type AppCreateArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * The data needed to create a App.
     */
    data: XOR<AppCreateInput, AppUncheckedCreateInput>
  }


  /**
   * App createMany
   */
  export type AppCreateManyArgs = {
    /**
     * The data used to create many Apps.
     */
    data: Enumerable<AppCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * App update
   */
  export type AppUpdateArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * The data needed to update a App.
     */
    data: XOR<AppUpdateInput, AppUncheckedUpdateInput>
    /**
     * Choose, which App to update.
     */
    where: AppWhereUniqueInput
  }


  /**
   * App updateMany
   */
  export type AppUpdateManyArgs = {
    /**
     * The data used to update Apps.
     */
    data: XOR<AppUpdateManyMutationInput, AppUncheckedUpdateManyInput>
    /**
     * Filter which Apps to update
     */
    where?: AppWhereInput
  }


  /**
   * App upsert
   */
  export type AppUpsertArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * The filter to search for the App to update in case it exists.
     */
    where: AppWhereUniqueInput
    /**
     * In case the App found by the `where` argument doesn't exist, create a new App with this data.
     */
    create: XOR<AppCreateInput, AppUncheckedCreateInput>
    /**
     * In case the App was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppUpdateInput, AppUncheckedUpdateInput>
  }


  /**
   * App delete
   */
  export type AppDeleteArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
    /**
     * Filter which App to delete.
     */
    where: AppWhereUniqueInput
  }


  /**
   * App deleteMany
   */
  export type AppDeleteManyArgs = {
    /**
     * Filter which Apps to delete
     */
    where?: AppWhereInput
  }


  /**
   * App.deployments
   */
  export type App$deploymentsArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    where?: DeploymentWhereInput
    orderBy?: Enumerable<DeploymentOrderByWithRelationInput>
    cursor?: DeploymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<DeploymentScalarFieldEnum>
  }


  /**
   * App.nodes
   */
  export type App$nodesArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    where?: DomNodeWhereInput
    orderBy?: Enumerable<DomNodeOrderByWithRelationInput>
    cursor?: DomNodeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<DomNodeScalarFieldEnum>
  }


  /**
   * App.releases
   */
  export type App$releasesArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    where?: ReleaseWhereInput
    orderBy?: Enumerable<ReleaseOrderByWithRelationInput>
    cursor?: ReleaseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<ReleaseScalarFieldEnum>
  }


  /**
   * App without action
   */
  export type AppArgs = {
    /**
     * Select specific fields to fetch from the App
     */
    select?: AppSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AppInclude | null
  }



  /**
   * Model DomNode
   */


  export type AggregateDomNode = {
    _count: DomNodeCountAggregateOutputType | null
    _min: DomNodeMinAggregateOutputType | null
    _max: DomNodeMaxAggregateOutputType | null
  }

  export type DomNodeMinAggregateOutputType = {
    id: string | null
    name: string | null
    type: DomNodeType | null
    parentId: string | null
    parentIndex: string | null
    parentProp: string | null
    appId: string | null
  }

  export type DomNodeMaxAggregateOutputType = {
    id: string | null
    name: string | null
    type: DomNodeType | null
    parentId: string | null
    parentIndex: string | null
    parentProp: string | null
    appId: string | null
  }

  export type DomNodeCountAggregateOutputType = {
    id: number
    name: number
    type: number
    parentId: number
    parentIndex: number
    parentProp: number
    appId: number
    _all: number
  }


  export type DomNodeMinAggregateInputType = {
    id?: true
    name?: true
    type?: true
    parentId?: true
    parentIndex?: true
    parentProp?: true
    appId?: true
  }

  export type DomNodeMaxAggregateInputType = {
    id?: true
    name?: true
    type?: true
    parentId?: true
    parentIndex?: true
    parentProp?: true
    appId?: true
  }

  export type DomNodeCountAggregateInputType = {
    id?: true
    name?: true
    type?: true
    parentId?: true
    parentIndex?: true
    parentProp?: true
    appId?: true
    _all?: true
  }

  export type DomNodeAggregateArgs = {
    /**
     * Filter which DomNode to aggregate.
     */
    where?: DomNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodes to fetch.
     */
    orderBy?: Enumerable<DomNodeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DomNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DomNodes
    **/
    _count?: true | DomNodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DomNodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DomNodeMaxAggregateInputType
  }

  export type GetDomNodeAggregateType<T extends DomNodeAggregateArgs> = {
        [P in keyof T & keyof AggregateDomNode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDomNode[P]>
      : GetScalarType<T[P], AggregateDomNode[P]>
  }




  export type DomNodeGroupByArgs = {
    where?: DomNodeWhereInput
    orderBy?: Enumerable<DomNodeOrderByWithAggregationInput>
    by: DomNodeScalarFieldEnum[]
    having?: DomNodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DomNodeCountAggregateInputType | true
    _min?: DomNodeMinAggregateInputType
    _max?: DomNodeMaxAggregateInputType
  }


  export type DomNodeGroupByOutputType = {
    id: string
    name: string
    type: DomNodeType
    parentId: string | null
    parentIndex: string | null
    parentProp: string | null
    appId: string
    _count: DomNodeCountAggregateOutputType | null
    _min: DomNodeMinAggregateOutputType | null
    _max: DomNodeMaxAggregateOutputType | null
  }

  type GetDomNodeGroupByPayload<T extends DomNodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<DomNodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DomNodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DomNodeGroupByOutputType[P]>
            : GetScalarType<T[P], DomNodeGroupByOutputType[P]>
        }
      >
    >


  export type DomNodeSelect = {
    id?: boolean
    name?: boolean
    type?: boolean
    parentId?: boolean
    parentIndex?: boolean
    parentProp?: boolean
    appId?: boolean
    app?: boolean | AppArgs
    parent?: boolean | DomNodeArgs
    children?: boolean | DomNode$childrenArgs
    attributes?: boolean | DomNode$attributesArgs
    _count?: boolean | DomNodeCountOutputTypeArgs
  }


  export type DomNodeInclude = {
    app?: boolean | AppArgs
    parent?: boolean | DomNodeArgs
    children?: boolean | DomNode$childrenArgs
    attributes?: boolean | DomNode$attributesArgs
    _count?: boolean | DomNodeCountOutputTypeArgs
  }

  export type DomNodeGetPayload<S extends boolean | null | undefined | DomNodeArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? DomNode :
    S extends undefined ? never :
    S extends { include: any } & (DomNodeArgs | DomNodeFindManyArgs)
    ? DomNode  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'app' ? AppGetPayload<S['include'][P]> :
        P extends 'parent' ? DomNodeGetPayload<S['include'][P]> | null :
        P extends 'children' ? Array < DomNodeGetPayload<S['include'][P]>>  :
        P extends 'attributes' ? Array < DomNodeAttributeGetPayload<S['include'][P]>>  :
        P extends '_count' ? DomNodeCountOutputTypeGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (DomNodeArgs | DomNodeFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'app' ? AppGetPayload<S['select'][P]> :
        P extends 'parent' ? DomNodeGetPayload<S['select'][P]> | null :
        P extends 'children' ? Array < DomNodeGetPayload<S['select'][P]>>  :
        P extends 'attributes' ? Array < DomNodeAttributeGetPayload<S['select'][P]>>  :
        P extends '_count' ? DomNodeCountOutputTypeGetPayload<S['select'][P]> :  P extends keyof DomNode ? DomNode[P] : never
  } 
      : DomNode


  type DomNodeCountArgs = 
    Omit<DomNodeFindManyArgs, 'select' | 'include'> & {
      select?: DomNodeCountAggregateInputType | true
    }

  export interface DomNodeDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one DomNode that matches the filter.
     * @param {DomNodeFindUniqueArgs} args - Arguments to find a DomNode
     * @example
     * // Get one DomNode
     * const domNode = await prisma.domNode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends DomNodeFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, DomNodeFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'DomNode'> extends True ? Prisma__DomNodeClient<DomNodeGetPayload<T>> : Prisma__DomNodeClient<DomNodeGetPayload<T> | null, null>

    /**
     * Find one DomNode that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {DomNodeFindUniqueOrThrowArgs} args - Arguments to find a DomNode
     * @example
     * // Get one DomNode
     * const domNode = await prisma.domNode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends DomNodeFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, DomNodeFindUniqueOrThrowArgs>
    ): Prisma__DomNodeClient<DomNodeGetPayload<T>>

    /**
     * Find the first DomNode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeFindFirstArgs} args - Arguments to find a DomNode
     * @example
     * // Get one DomNode
     * const domNode = await prisma.domNode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends DomNodeFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, DomNodeFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'DomNode'> extends True ? Prisma__DomNodeClient<DomNodeGetPayload<T>> : Prisma__DomNodeClient<DomNodeGetPayload<T> | null, null>

    /**
     * Find the first DomNode that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeFindFirstOrThrowArgs} args - Arguments to find a DomNode
     * @example
     * // Get one DomNode
     * const domNode = await prisma.domNode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends DomNodeFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DomNodeFindFirstOrThrowArgs>
    ): Prisma__DomNodeClient<DomNodeGetPayload<T>>

    /**
     * Find zero or more DomNodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DomNodes
     * const domNodes = await prisma.domNode.findMany()
     * 
     * // Get first 10 DomNodes
     * const domNodes = await prisma.domNode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const domNodeWithIdOnly = await prisma.domNode.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends DomNodeFindManyArgs>(
      args?: SelectSubset<T, DomNodeFindManyArgs>
    ): Prisma.PrismaPromise<Array<DomNodeGetPayload<T>>>

    /**
     * Create a DomNode.
     * @param {DomNodeCreateArgs} args - Arguments to create a DomNode.
     * @example
     * // Create one DomNode
     * const DomNode = await prisma.domNode.create({
     *   data: {
     *     // ... data to create a DomNode
     *   }
     * })
     * 
    **/
    create<T extends DomNodeCreateArgs>(
      args: SelectSubset<T, DomNodeCreateArgs>
    ): Prisma__DomNodeClient<DomNodeGetPayload<T>>

    /**
     * Create many DomNodes.
     *     @param {DomNodeCreateManyArgs} args - Arguments to create many DomNodes.
     *     @example
     *     // Create many DomNodes
     *     const domNode = await prisma.domNode.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends DomNodeCreateManyArgs>(
      args?: SelectSubset<T, DomNodeCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DomNode.
     * @param {DomNodeDeleteArgs} args - Arguments to delete one DomNode.
     * @example
     * // Delete one DomNode
     * const DomNode = await prisma.domNode.delete({
     *   where: {
     *     // ... filter to delete one DomNode
     *   }
     * })
     * 
    **/
    delete<T extends DomNodeDeleteArgs>(
      args: SelectSubset<T, DomNodeDeleteArgs>
    ): Prisma__DomNodeClient<DomNodeGetPayload<T>>

    /**
     * Update one DomNode.
     * @param {DomNodeUpdateArgs} args - Arguments to update one DomNode.
     * @example
     * // Update one DomNode
     * const domNode = await prisma.domNode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends DomNodeUpdateArgs>(
      args: SelectSubset<T, DomNodeUpdateArgs>
    ): Prisma__DomNodeClient<DomNodeGetPayload<T>>

    /**
     * Delete zero or more DomNodes.
     * @param {DomNodeDeleteManyArgs} args - Arguments to filter DomNodes to delete.
     * @example
     * // Delete a few DomNodes
     * const { count } = await prisma.domNode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends DomNodeDeleteManyArgs>(
      args?: SelectSubset<T, DomNodeDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DomNodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DomNodes
     * const domNode = await prisma.domNode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends DomNodeUpdateManyArgs>(
      args: SelectSubset<T, DomNodeUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DomNode.
     * @param {DomNodeUpsertArgs} args - Arguments to update or create a DomNode.
     * @example
     * // Update or create a DomNode
     * const domNode = await prisma.domNode.upsert({
     *   create: {
     *     // ... data to create a DomNode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DomNode we want to update
     *   }
     * })
    **/
    upsert<T extends DomNodeUpsertArgs>(
      args: SelectSubset<T, DomNodeUpsertArgs>
    ): Prisma__DomNodeClient<DomNodeGetPayload<T>>

    /**
     * Count the number of DomNodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeCountArgs} args - Arguments to filter DomNodes to count.
     * @example
     * // Count the number of DomNodes
     * const count = await prisma.domNode.count({
     *   where: {
     *     // ... the filter for the DomNodes we want to count
     *   }
     * })
    **/
    count<T extends DomNodeCountArgs>(
      args?: Subset<T, DomNodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DomNodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DomNode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DomNodeAggregateArgs>(args: Subset<T, DomNodeAggregateArgs>): Prisma.PrismaPromise<GetDomNodeAggregateType<T>>

    /**
     * Group by DomNode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DomNodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DomNodeGroupByArgs['orderBy'] }
        : { orderBy?: DomNodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DomNodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDomNodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for DomNode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__DomNodeClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    app<T extends AppArgs= {}>(args?: Subset<T, AppArgs>): Prisma__AppClient<AppGetPayload<T> | Null>;

    parent<T extends DomNodeArgs= {}>(args?: Subset<T, DomNodeArgs>): Prisma__DomNodeClient<DomNodeGetPayload<T> | Null>;

    children<T extends DomNode$childrenArgs= {}>(args?: Subset<T, DomNode$childrenArgs>): Prisma.PrismaPromise<Array<DomNodeGetPayload<T>>| Null>;

    attributes<T extends DomNode$attributesArgs= {}>(args?: Subset<T, DomNode$attributesArgs>): Prisma.PrismaPromise<Array<DomNodeAttributeGetPayload<T>>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * DomNode base type for findUnique actions
   */
  export type DomNodeFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * Filter, which DomNode to fetch.
     */
    where: DomNodeWhereUniqueInput
  }

  /**
   * DomNode findUnique
   */
  export interface DomNodeFindUniqueArgs extends DomNodeFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * DomNode findUniqueOrThrow
   */
  export type DomNodeFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * Filter, which DomNode to fetch.
     */
    where: DomNodeWhereUniqueInput
  }


  /**
   * DomNode base type for findFirst actions
   */
  export type DomNodeFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * Filter, which DomNode to fetch.
     */
    where?: DomNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodes to fetch.
     */
    orderBy?: Enumerable<DomNodeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DomNodes.
     */
    cursor?: DomNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DomNodes.
     */
    distinct?: Enumerable<DomNodeScalarFieldEnum>
  }

  /**
   * DomNode findFirst
   */
  export interface DomNodeFindFirstArgs extends DomNodeFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * DomNode findFirstOrThrow
   */
  export type DomNodeFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * Filter, which DomNode to fetch.
     */
    where?: DomNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodes to fetch.
     */
    orderBy?: Enumerable<DomNodeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DomNodes.
     */
    cursor?: DomNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DomNodes.
     */
    distinct?: Enumerable<DomNodeScalarFieldEnum>
  }


  /**
   * DomNode findMany
   */
  export type DomNodeFindManyArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * Filter, which DomNodes to fetch.
     */
    where?: DomNodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodes to fetch.
     */
    orderBy?: Enumerable<DomNodeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DomNodes.
     */
    cursor?: DomNodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodes.
     */
    skip?: number
    distinct?: Enumerable<DomNodeScalarFieldEnum>
  }


  /**
   * DomNode create
   */
  export type DomNodeCreateArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * The data needed to create a DomNode.
     */
    data: XOR<DomNodeCreateInput, DomNodeUncheckedCreateInput>
  }


  /**
   * DomNode createMany
   */
  export type DomNodeCreateManyArgs = {
    /**
     * The data used to create many DomNodes.
     */
    data: Enumerable<DomNodeCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * DomNode update
   */
  export type DomNodeUpdateArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * The data needed to update a DomNode.
     */
    data: XOR<DomNodeUpdateInput, DomNodeUncheckedUpdateInput>
    /**
     * Choose, which DomNode to update.
     */
    where: DomNodeWhereUniqueInput
  }


  /**
   * DomNode updateMany
   */
  export type DomNodeUpdateManyArgs = {
    /**
     * The data used to update DomNodes.
     */
    data: XOR<DomNodeUpdateManyMutationInput, DomNodeUncheckedUpdateManyInput>
    /**
     * Filter which DomNodes to update
     */
    where?: DomNodeWhereInput
  }


  /**
   * DomNode upsert
   */
  export type DomNodeUpsertArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * The filter to search for the DomNode to update in case it exists.
     */
    where: DomNodeWhereUniqueInput
    /**
     * In case the DomNode found by the `where` argument doesn't exist, create a new DomNode with this data.
     */
    create: XOR<DomNodeCreateInput, DomNodeUncheckedCreateInput>
    /**
     * In case the DomNode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DomNodeUpdateInput, DomNodeUncheckedUpdateInput>
  }


  /**
   * DomNode delete
   */
  export type DomNodeDeleteArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    /**
     * Filter which DomNode to delete.
     */
    where: DomNodeWhereUniqueInput
  }


  /**
   * DomNode deleteMany
   */
  export type DomNodeDeleteManyArgs = {
    /**
     * Filter which DomNodes to delete
     */
    where?: DomNodeWhereInput
  }


  /**
   * DomNode.children
   */
  export type DomNode$childrenArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
    where?: DomNodeWhereInput
    orderBy?: Enumerable<DomNodeOrderByWithRelationInput>
    cursor?: DomNodeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<DomNodeScalarFieldEnum>
  }


  /**
   * DomNode.attributes
   */
  export type DomNode$attributesArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    where?: DomNodeAttributeWhereInput
    orderBy?: Enumerable<DomNodeAttributeOrderByWithRelationInput>
    cursor?: DomNodeAttributeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<DomNodeAttributeScalarFieldEnum>
  }


  /**
   * DomNode without action
   */
  export type DomNodeArgs = {
    /**
     * Select specific fields to fetch from the DomNode
     */
    select?: DomNodeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeInclude | null
  }



  /**
   * Model DomNodeAttribute
   */


  export type AggregateDomNodeAttribute = {
    _count: DomNodeAttributeCountAggregateOutputType | null
    _min: DomNodeAttributeMinAggregateOutputType | null
    _max: DomNodeAttributeMaxAggregateOutputType | null
  }

  export type DomNodeAttributeMinAggregateOutputType = {
    nodeId: string | null
    namespace: string | null
    name: string | null
    type: DomNodeAttributeType | null
    value: string | null
  }

  export type DomNodeAttributeMaxAggregateOutputType = {
    nodeId: string | null
    namespace: string | null
    name: string | null
    type: DomNodeAttributeType | null
    value: string | null
  }

  export type DomNodeAttributeCountAggregateOutputType = {
    nodeId: number
    namespace: number
    name: number
    type: number
    value: number
    _all: number
  }


  export type DomNodeAttributeMinAggregateInputType = {
    nodeId?: true
    namespace?: true
    name?: true
    type?: true
    value?: true
  }

  export type DomNodeAttributeMaxAggregateInputType = {
    nodeId?: true
    namespace?: true
    name?: true
    type?: true
    value?: true
  }

  export type DomNodeAttributeCountAggregateInputType = {
    nodeId?: true
    namespace?: true
    name?: true
    type?: true
    value?: true
    _all?: true
  }

  export type DomNodeAttributeAggregateArgs = {
    /**
     * Filter which DomNodeAttribute to aggregate.
     */
    where?: DomNodeAttributeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodeAttributes to fetch.
     */
    orderBy?: Enumerable<DomNodeAttributeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DomNodeAttributeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodeAttributes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodeAttributes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DomNodeAttributes
    **/
    _count?: true | DomNodeAttributeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DomNodeAttributeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DomNodeAttributeMaxAggregateInputType
  }

  export type GetDomNodeAttributeAggregateType<T extends DomNodeAttributeAggregateArgs> = {
        [P in keyof T & keyof AggregateDomNodeAttribute]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDomNodeAttribute[P]>
      : GetScalarType<T[P], AggregateDomNodeAttribute[P]>
  }




  export type DomNodeAttributeGroupByArgs = {
    where?: DomNodeAttributeWhereInput
    orderBy?: Enumerable<DomNodeAttributeOrderByWithAggregationInput>
    by: DomNodeAttributeScalarFieldEnum[]
    having?: DomNodeAttributeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DomNodeAttributeCountAggregateInputType | true
    _min?: DomNodeAttributeMinAggregateInputType
    _max?: DomNodeAttributeMaxAggregateInputType
  }


  export type DomNodeAttributeGroupByOutputType = {
    nodeId: string
    namespace: string
    name: string
    type: DomNodeAttributeType
    value: string
    _count: DomNodeAttributeCountAggregateOutputType | null
    _min: DomNodeAttributeMinAggregateOutputType | null
    _max: DomNodeAttributeMaxAggregateOutputType | null
  }

  type GetDomNodeAttributeGroupByPayload<T extends DomNodeAttributeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<DomNodeAttributeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DomNodeAttributeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DomNodeAttributeGroupByOutputType[P]>
            : GetScalarType<T[P], DomNodeAttributeGroupByOutputType[P]>
        }
      >
    >


  export type DomNodeAttributeSelect = {
    nodeId?: boolean
    namespace?: boolean
    name?: boolean
    type?: boolean
    value?: boolean
    node?: boolean | DomNodeArgs
  }


  export type DomNodeAttributeInclude = {
    node?: boolean | DomNodeArgs
  }

  export type DomNodeAttributeGetPayload<S extends boolean | null | undefined | DomNodeAttributeArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? DomNodeAttribute :
    S extends undefined ? never :
    S extends { include: any } & (DomNodeAttributeArgs | DomNodeAttributeFindManyArgs)
    ? DomNodeAttribute  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'node' ? DomNodeGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (DomNodeAttributeArgs | DomNodeAttributeFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'node' ? DomNodeGetPayload<S['select'][P]> :  P extends keyof DomNodeAttribute ? DomNodeAttribute[P] : never
  } 
      : DomNodeAttribute


  type DomNodeAttributeCountArgs = 
    Omit<DomNodeAttributeFindManyArgs, 'select' | 'include'> & {
      select?: DomNodeAttributeCountAggregateInputType | true
    }

  export interface DomNodeAttributeDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one DomNodeAttribute that matches the filter.
     * @param {DomNodeAttributeFindUniqueArgs} args - Arguments to find a DomNodeAttribute
     * @example
     * // Get one DomNodeAttribute
     * const domNodeAttribute = await prisma.domNodeAttribute.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends DomNodeAttributeFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, DomNodeAttributeFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'DomNodeAttribute'> extends True ? Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>> : Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T> | null, null>

    /**
     * Find one DomNodeAttribute that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {DomNodeAttributeFindUniqueOrThrowArgs} args - Arguments to find a DomNodeAttribute
     * @example
     * // Get one DomNodeAttribute
     * const domNodeAttribute = await prisma.domNodeAttribute.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends DomNodeAttributeFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, DomNodeAttributeFindUniqueOrThrowArgs>
    ): Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>>

    /**
     * Find the first DomNodeAttribute that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAttributeFindFirstArgs} args - Arguments to find a DomNodeAttribute
     * @example
     * // Get one DomNodeAttribute
     * const domNodeAttribute = await prisma.domNodeAttribute.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends DomNodeAttributeFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, DomNodeAttributeFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'DomNodeAttribute'> extends True ? Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>> : Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T> | null, null>

    /**
     * Find the first DomNodeAttribute that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAttributeFindFirstOrThrowArgs} args - Arguments to find a DomNodeAttribute
     * @example
     * // Get one DomNodeAttribute
     * const domNodeAttribute = await prisma.domNodeAttribute.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends DomNodeAttributeFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DomNodeAttributeFindFirstOrThrowArgs>
    ): Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>>

    /**
     * Find zero or more DomNodeAttributes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAttributeFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DomNodeAttributes
     * const domNodeAttributes = await prisma.domNodeAttribute.findMany()
     * 
     * // Get first 10 DomNodeAttributes
     * const domNodeAttributes = await prisma.domNodeAttribute.findMany({ take: 10 })
     * 
     * // Only select the `nodeId`
     * const domNodeAttributeWithNodeIdOnly = await prisma.domNodeAttribute.findMany({ select: { nodeId: true } })
     * 
    **/
    findMany<T extends DomNodeAttributeFindManyArgs>(
      args?: SelectSubset<T, DomNodeAttributeFindManyArgs>
    ): Prisma.PrismaPromise<Array<DomNodeAttributeGetPayload<T>>>

    /**
     * Create a DomNodeAttribute.
     * @param {DomNodeAttributeCreateArgs} args - Arguments to create a DomNodeAttribute.
     * @example
     * // Create one DomNodeAttribute
     * const DomNodeAttribute = await prisma.domNodeAttribute.create({
     *   data: {
     *     // ... data to create a DomNodeAttribute
     *   }
     * })
     * 
    **/
    create<T extends DomNodeAttributeCreateArgs>(
      args: SelectSubset<T, DomNodeAttributeCreateArgs>
    ): Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>>

    /**
     * Create many DomNodeAttributes.
     *     @param {DomNodeAttributeCreateManyArgs} args - Arguments to create many DomNodeAttributes.
     *     @example
     *     // Create many DomNodeAttributes
     *     const domNodeAttribute = await prisma.domNodeAttribute.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends DomNodeAttributeCreateManyArgs>(
      args?: SelectSubset<T, DomNodeAttributeCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DomNodeAttribute.
     * @param {DomNodeAttributeDeleteArgs} args - Arguments to delete one DomNodeAttribute.
     * @example
     * // Delete one DomNodeAttribute
     * const DomNodeAttribute = await prisma.domNodeAttribute.delete({
     *   where: {
     *     // ... filter to delete one DomNodeAttribute
     *   }
     * })
     * 
    **/
    delete<T extends DomNodeAttributeDeleteArgs>(
      args: SelectSubset<T, DomNodeAttributeDeleteArgs>
    ): Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>>

    /**
     * Update one DomNodeAttribute.
     * @param {DomNodeAttributeUpdateArgs} args - Arguments to update one DomNodeAttribute.
     * @example
     * // Update one DomNodeAttribute
     * const domNodeAttribute = await prisma.domNodeAttribute.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends DomNodeAttributeUpdateArgs>(
      args: SelectSubset<T, DomNodeAttributeUpdateArgs>
    ): Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>>

    /**
     * Delete zero or more DomNodeAttributes.
     * @param {DomNodeAttributeDeleteManyArgs} args - Arguments to filter DomNodeAttributes to delete.
     * @example
     * // Delete a few DomNodeAttributes
     * const { count } = await prisma.domNodeAttribute.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends DomNodeAttributeDeleteManyArgs>(
      args?: SelectSubset<T, DomNodeAttributeDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DomNodeAttributes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAttributeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DomNodeAttributes
     * const domNodeAttribute = await prisma.domNodeAttribute.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends DomNodeAttributeUpdateManyArgs>(
      args: SelectSubset<T, DomNodeAttributeUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DomNodeAttribute.
     * @param {DomNodeAttributeUpsertArgs} args - Arguments to update or create a DomNodeAttribute.
     * @example
     * // Update or create a DomNodeAttribute
     * const domNodeAttribute = await prisma.domNodeAttribute.upsert({
     *   create: {
     *     // ... data to create a DomNodeAttribute
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DomNodeAttribute we want to update
     *   }
     * })
    **/
    upsert<T extends DomNodeAttributeUpsertArgs>(
      args: SelectSubset<T, DomNodeAttributeUpsertArgs>
    ): Prisma__DomNodeAttributeClient<DomNodeAttributeGetPayload<T>>

    /**
     * Count the number of DomNodeAttributes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAttributeCountArgs} args - Arguments to filter DomNodeAttributes to count.
     * @example
     * // Count the number of DomNodeAttributes
     * const count = await prisma.domNodeAttribute.count({
     *   where: {
     *     // ... the filter for the DomNodeAttributes we want to count
     *   }
     * })
    **/
    count<T extends DomNodeAttributeCountArgs>(
      args?: Subset<T, DomNodeAttributeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DomNodeAttributeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DomNodeAttribute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAttributeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DomNodeAttributeAggregateArgs>(args: Subset<T, DomNodeAttributeAggregateArgs>): Prisma.PrismaPromise<GetDomNodeAttributeAggregateType<T>>

    /**
     * Group by DomNodeAttribute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DomNodeAttributeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DomNodeAttributeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DomNodeAttributeGroupByArgs['orderBy'] }
        : { orderBy?: DomNodeAttributeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DomNodeAttributeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDomNodeAttributeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for DomNodeAttribute.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__DomNodeAttributeClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    node<T extends DomNodeArgs= {}>(args?: Subset<T, DomNodeArgs>): Prisma__DomNodeClient<DomNodeGetPayload<T> | Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * DomNodeAttribute base type for findUnique actions
   */
  export type DomNodeAttributeFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * Filter, which DomNodeAttribute to fetch.
     */
    where: DomNodeAttributeWhereUniqueInput
  }

  /**
   * DomNodeAttribute findUnique
   */
  export interface DomNodeAttributeFindUniqueArgs extends DomNodeAttributeFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * DomNodeAttribute findUniqueOrThrow
   */
  export type DomNodeAttributeFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * Filter, which DomNodeAttribute to fetch.
     */
    where: DomNodeAttributeWhereUniqueInput
  }


  /**
   * DomNodeAttribute base type for findFirst actions
   */
  export type DomNodeAttributeFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * Filter, which DomNodeAttribute to fetch.
     */
    where?: DomNodeAttributeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodeAttributes to fetch.
     */
    orderBy?: Enumerable<DomNodeAttributeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DomNodeAttributes.
     */
    cursor?: DomNodeAttributeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodeAttributes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodeAttributes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DomNodeAttributes.
     */
    distinct?: Enumerable<DomNodeAttributeScalarFieldEnum>
  }

  /**
   * DomNodeAttribute findFirst
   */
  export interface DomNodeAttributeFindFirstArgs extends DomNodeAttributeFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * DomNodeAttribute findFirstOrThrow
   */
  export type DomNodeAttributeFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * Filter, which DomNodeAttribute to fetch.
     */
    where?: DomNodeAttributeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodeAttributes to fetch.
     */
    orderBy?: Enumerable<DomNodeAttributeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DomNodeAttributes.
     */
    cursor?: DomNodeAttributeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodeAttributes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodeAttributes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DomNodeAttributes.
     */
    distinct?: Enumerable<DomNodeAttributeScalarFieldEnum>
  }


  /**
   * DomNodeAttribute findMany
   */
  export type DomNodeAttributeFindManyArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * Filter, which DomNodeAttributes to fetch.
     */
    where?: DomNodeAttributeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DomNodeAttributes to fetch.
     */
    orderBy?: Enumerable<DomNodeAttributeOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DomNodeAttributes.
     */
    cursor?: DomNodeAttributeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DomNodeAttributes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DomNodeAttributes.
     */
    skip?: number
    distinct?: Enumerable<DomNodeAttributeScalarFieldEnum>
  }


  /**
   * DomNodeAttribute create
   */
  export type DomNodeAttributeCreateArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * The data needed to create a DomNodeAttribute.
     */
    data: XOR<DomNodeAttributeCreateInput, DomNodeAttributeUncheckedCreateInput>
  }


  /**
   * DomNodeAttribute createMany
   */
  export type DomNodeAttributeCreateManyArgs = {
    /**
     * The data used to create many DomNodeAttributes.
     */
    data: Enumerable<DomNodeAttributeCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * DomNodeAttribute update
   */
  export type DomNodeAttributeUpdateArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * The data needed to update a DomNodeAttribute.
     */
    data: XOR<DomNodeAttributeUpdateInput, DomNodeAttributeUncheckedUpdateInput>
    /**
     * Choose, which DomNodeAttribute to update.
     */
    where: DomNodeAttributeWhereUniqueInput
  }


  /**
   * DomNodeAttribute updateMany
   */
  export type DomNodeAttributeUpdateManyArgs = {
    /**
     * The data used to update DomNodeAttributes.
     */
    data: XOR<DomNodeAttributeUpdateManyMutationInput, DomNodeAttributeUncheckedUpdateManyInput>
    /**
     * Filter which DomNodeAttributes to update
     */
    where?: DomNodeAttributeWhereInput
  }


  /**
   * DomNodeAttribute upsert
   */
  export type DomNodeAttributeUpsertArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * The filter to search for the DomNodeAttribute to update in case it exists.
     */
    where: DomNodeAttributeWhereUniqueInput
    /**
     * In case the DomNodeAttribute found by the `where` argument doesn't exist, create a new DomNodeAttribute with this data.
     */
    create: XOR<DomNodeAttributeCreateInput, DomNodeAttributeUncheckedCreateInput>
    /**
     * In case the DomNodeAttribute was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DomNodeAttributeUpdateInput, DomNodeAttributeUncheckedUpdateInput>
  }


  /**
   * DomNodeAttribute delete
   */
  export type DomNodeAttributeDeleteArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
    /**
     * Filter which DomNodeAttribute to delete.
     */
    where: DomNodeAttributeWhereUniqueInput
  }


  /**
   * DomNodeAttribute deleteMany
   */
  export type DomNodeAttributeDeleteManyArgs = {
    /**
     * Filter which DomNodeAttributes to delete
     */
    where?: DomNodeAttributeWhereInput
  }


  /**
   * DomNodeAttribute without action
   */
  export type DomNodeAttributeArgs = {
    /**
     * Select specific fields to fetch from the DomNodeAttribute
     */
    select?: DomNodeAttributeSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DomNodeAttributeInclude | null
  }



  /**
   * Model Release
   */


  export type AggregateRelease = {
    _count: ReleaseCountAggregateOutputType | null
    _avg: ReleaseAvgAggregateOutputType | null
    _sum: ReleaseSumAggregateOutputType | null
    _min: ReleaseMinAggregateOutputType | null
    _max: ReleaseMaxAggregateOutputType | null
  }

  export type ReleaseAvgAggregateOutputType = {
    version: number | null
  }

  export type ReleaseSumAggregateOutputType = {
    version: number | null
  }

  export type ReleaseMinAggregateOutputType = {
    description: string | null
    createdAt: Date | null
    snapshot: Buffer | null
    appId: string | null
    version: number | null
  }

  export type ReleaseMaxAggregateOutputType = {
    description: string | null
    createdAt: Date | null
    snapshot: Buffer | null
    appId: string | null
    version: number | null
  }

  export type ReleaseCountAggregateOutputType = {
    description: number
    createdAt: number
    snapshot: number
    appId: number
    version: number
    _all: number
  }


  export type ReleaseAvgAggregateInputType = {
    version?: true
  }

  export type ReleaseSumAggregateInputType = {
    version?: true
  }

  export type ReleaseMinAggregateInputType = {
    description?: true
    createdAt?: true
    snapshot?: true
    appId?: true
    version?: true
  }

  export type ReleaseMaxAggregateInputType = {
    description?: true
    createdAt?: true
    snapshot?: true
    appId?: true
    version?: true
  }

  export type ReleaseCountAggregateInputType = {
    description?: true
    createdAt?: true
    snapshot?: true
    appId?: true
    version?: true
    _all?: true
  }

  export type ReleaseAggregateArgs = {
    /**
     * Filter which Release to aggregate.
     */
    where?: ReleaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Releases to fetch.
     */
    orderBy?: Enumerable<ReleaseOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReleaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Releases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Releases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Releases
    **/
    _count?: true | ReleaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReleaseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReleaseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReleaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReleaseMaxAggregateInputType
  }

  export type GetReleaseAggregateType<T extends ReleaseAggregateArgs> = {
        [P in keyof T & keyof AggregateRelease]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRelease[P]>
      : GetScalarType<T[P], AggregateRelease[P]>
  }




  export type ReleaseGroupByArgs = {
    where?: ReleaseWhereInput
    orderBy?: Enumerable<ReleaseOrderByWithAggregationInput>
    by: ReleaseScalarFieldEnum[]
    having?: ReleaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReleaseCountAggregateInputType | true
    _avg?: ReleaseAvgAggregateInputType
    _sum?: ReleaseSumAggregateInputType
    _min?: ReleaseMinAggregateInputType
    _max?: ReleaseMaxAggregateInputType
  }


  export type ReleaseGroupByOutputType = {
    description: string
    createdAt: Date
    snapshot: Buffer
    appId: string
    version: number
    _count: ReleaseCountAggregateOutputType | null
    _avg: ReleaseAvgAggregateOutputType | null
    _sum: ReleaseSumAggregateOutputType | null
    _min: ReleaseMinAggregateOutputType | null
    _max: ReleaseMaxAggregateOutputType | null
  }

  type GetReleaseGroupByPayload<T extends ReleaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<ReleaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReleaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReleaseGroupByOutputType[P]>
            : GetScalarType<T[P], ReleaseGroupByOutputType[P]>
        }
      >
    >


  export type ReleaseSelect = {
    description?: boolean
    createdAt?: boolean
    snapshot?: boolean
    appId?: boolean
    version?: boolean
    app?: boolean | AppArgs
    deployments?: boolean | Release$deploymentsArgs
    _count?: boolean | ReleaseCountOutputTypeArgs
  }


  export type ReleaseInclude = {
    app?: boolean | AppArgs
    deployments?: boolean | Release$deploymentsArgs
    _count?: boolean | ReleaseCountOutputTypeArgs
  }

  export type ReleaseGetPayload<S extends boolean | null | undefined | ReleaseArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Release :
    S extends undefined ? never :
    S extends { include: any } & (ReleaseArgs | ReleaseFindManyArgs)
    ? Release  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'app' ? AppGetPayload<S['include'][P]> :
        P extends 'deployments' ? Array < DeploymentGetPayload<S['include'][P]>>  :
        P extends '_count' ? ReleaseCountOutputTypeGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (ReleaseArgs | ReleaseFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'app' ? AppGetPayload<S['select'][P]> :
        P extends 'deployments' ? Array < DeploymentGetPayload<S['select'][P]>>  :
        P extends '_count' ? ReleaseCountOutputTypeGetPayload<S['select'][P]> :  P extends keyof Release ? Release[P] : never
  } 
      : Release


  type ReleaseCountArgs = 
    Omit<ReleaseFindManyArgs, 'select' | 'include'> & {
      select?: ReleaseCountAggregateInputType | true
    }

  export interface ReleaseDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one Release that matches the filter.
     * @param {ReleaseFindUniqueArgs} args - Arguments to find a Release
     * @example
     * // Get one Release
     * const release = await prisma.release.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ReleaseFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, ReleaseFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Release'> extends True ? Prisma__ReleaseClient<ReleaseGetPayload<T>> : Prisma__ReleaseClient<ReleaseGetPayload<T> | null, null>

    /**
     * Find one Release that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {ReleaseFindUniqueOrThrowArgs} args - Arguments to find a Release
     * @example
     * // Get one Release
     * const release = await prisma.release.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ReleaseFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, ReleaseFindUniqueOrThrowArgs>
    ): Prisma__ReleaseClient<ReleaseGetPayload<T>>

    /**
     * Find the first Release that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReleaseFindFirstArgs} args - Arguments to find a Release
     * @example
     * // Get one Release
     * const release = await prisma.release.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ReleaseFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, ReleaseFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Release'> extends True ? Prisma__ReleaseClient<ReleaseGetPayload<T>> : Prisma__ReleaseClient<ReleaseGetPayload<T> | null, null>

    /**
     * Find the first Release that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReleaseFindFirstOrThrowArgs} args - Arguments to find a Release
     * @example
     * // Get one Release
     * const release = await prisma.release.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ReleaseFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ReleaseFindFirstOrThrowArgs>
    ): Prisma__ReleaseClient<ReleaseGetPayload<T>>

    /**
     * Find zero or more Releases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReleaseFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Releases
     * const releases = await prisma.release.findMany()
     * 
     * // Get first 10 Releases
     * const releases = await prisma.release.findMany({ take: 10 })
     * 
     * // Only select the `description`
     * const releaseWithDescriptionOnly = await prisma.release.findMany({ select: { description: true } })
     * 
    **/
    findMany<T extends ReleaseFindManyArgs>(
      args?: SelectSubset<T, ReleaseFindManyArgs>
    ): Prisma.PrismaPromise<Array<ReleaseGetPayload<T>>>

    /**
     * Create a Release.
     * @param {ReleaseCreateArgs} args - Arguments to create a Release.
     * @example
     * // Create one Release
     * const Release = await prisma.release.create({
     *   data: {
     *     // ... data to create a Release
     *   }
     * })
     * 
    **/
    create<T extends ReleaseCreateArgs>(
      args: SelectSubset<T, ReleaseCreateArgs>
    ): Prisma__ReleaseClient<ReleaseGetPayload<T>>

    /**
     * Create many Releases.
     *     @param {ReleaseCreateManyArgs} args - Arguments to create many Releases.
     *     @example
     *     // Create many Releases
     *     const release = await prisma.release.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends ReleaseCreateManyArgs>(
      args?: SelectSubset<T, ReleaseCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Release.
     * @param {ReleaseDeleteArgs} args - Arguments to delete one Release.
     * @example
     * // Delete one Release
     * const Release = await prisma.release.delete({
     *   where: {
     *     // ... filter to delete one Release
     *   }
     * })
     * 
    **/
    delete<T extends ReleaseDeleteArgs>(
      args: SelectSubset<T, ReleaseDeleteArgs>
    ): Prisma__ReleaseClient<ReleaseGetPayload<T>>

    /**
     * Update one Release.
     * @param {ReleaseUpdateArgs} args - Arguments to update one Release.
     * @example
     * // Update one Release
     * const release = await prisma.release.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ReleaseUpdateArgs>(
      args: SelectSubset<T, ReleaseUpdateArgs>
    ): Prisma__ReleaseClient<ReleaseGetPayload<T>>

    /**
     * Delete zero or more Releases.
     * @param {ReleaseDeleteManyArgs} args - Arguments to filter Releases to delete.
     * @example
     * // Delete a few Releases
     * const { count } = await prisma.release.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ReleaseDeleteManyArgs>(
      args?: SelectSubset<T, ReleaseDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Releases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReleaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Releases
     * const release = await prisma.release.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ReleaseUpdateManyArgs>(
      args: SelectSubset<T, ReleaseUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Release.
     * @param {ReleaseUpsertArgs} args - Arguments to update or create a Release.
     * @example
     * // Update or create a Release
     * const release = await prisma.release.upsert({
     *   create: {
     *     // ... data to create a Release
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Release we want to update
     *   }
     * })
    **/
    upsert<T extends ReleaseUpsertArgs>(
      args: SelectSubset<T, ReleaseUpsertArgs>
    ): Prisma__ReleaseClient<ReleaseGetPayload<T>>

    /**
     * Count the number of Releases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReleaseCountArgs} args - Arguments to filter Releases to count.
     * @example
     * // Count the number of Releases
     * const count = await prisma.release.count({
     *   where: {
     *     // ... the filter for the Releases we want to count
     *   }
     * })
    **/
    count<T extends ReleaseCountArgs>(
      args?: Subset<T, ReleaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReleaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Release.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReleaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReleaseAggregateArgs>(args: Subset<T, ReleaseAggregateArgs>): Prisma.PrismaPromise<GetReleaseAggregateType<T>>

    /**
     * Group by Release.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReleaseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReleaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReleaseGroupByArgs['orderBy'] }
        : { orderBy?: ReleaseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReleaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReleaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Release.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__ReleaseClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    app<T extends AppArgs= {}>(args?: Subset<T, AppArgs>): Prisma__AppClient<AppGetPayload<T> | Null>;

    deployments<T extends Release$deploymentsArgs= {}>(args?: Subset<T, Release$deploymentsArgs>): Prisma.PrismaPromise<Array<DeploymentGetPayload<T>>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Release base type for findUnique actions
   */
  export type ReleaseFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * Filter, which Release to fetch.
     */
    where: ReleaseWhereUniqueInput
  }

  /**
   * Release findUnique
   */
  export interface ReleaseFindUniqueArgs extends ReleaseFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Release findUniqueOrThrow
   */
  export type ReleaseFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * Filter, which Release to fetch.
     */
    where: ReleaseWhereUniqueInput
  }


  /**
   * Release base type for findFirst actions
   */
  export type ReleaseFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * Filter, which Release to fetch.
     */
    where?: ReleaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Releases to fetch.
     */
    orderBy?: Enumerable<ReleaseOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Releases.
     */
    cursor?: ReleaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Releases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Releases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Releases.
     */
    distinct?: Enumerable<ReleaseScalarFieldEnum>
  }

  /**
   * Release findFirst
   */
  export interface ReleaseFindFirstArgs extends ReleaseFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Release findFirstOrThrow
   */
  export type ReleaseFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * Filter, which Release to fetch.
     */
    where?: ReleaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Releases to fetch.
     */
    orderBy?: Enumerable<ReleaseOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Releases.
     */
    cursor?: ReleaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Releases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Releases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Releases.
     */
    distinct?: Enumerable<ReleaseScalarFieldEnum>
  }


  /**
   * Release findMany
   */
  export type ReleaseFindManyArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * Filter, which Releases to fetch.
     */
    where?: ReleaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Releases to fetch.
     */
    orderBy?: Enumerable<ReleaseOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Releases.
     */
    cursor?: ReleaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Releases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Releases.
     */
    skip?: number
    distinct?: Enumerable<ReleaseScalarFieldEnum>
  }


  /**
   * Release create
   */
  export type ReleaseCreateArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * The data needed to create a Release.
     */
    data: XOR<ReleaseCreateInput, ReleaseUncheckedCreateInput>
  }


  /**
   * Release createMany
   */
  export type ReleaseCreateManyArgs = {
    /**
     * The data used to create many Releases.
     */
    data: Enumerable<ReleaseCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Release update
   */
  export type ReleaseUpdateArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * The data needed to update a Release.
     */
    data: XOR<ReleaseUpdateInput, ReleaseUncheckedUpdateInput>
    /**
     * Choose, which Release to update.
     */
    where: ReleaseWhereUniqueInput
  }


  /**
   * Release updateMany
   */
  export type ReleaseUpdateManyArgs = {
    /**
     * The data used to update Releases.
     */
    data: XOR<ReleaseUpdateManyMutationInput, ReleaseUncheckedUpdateManyInput>
    /**
     * Filter which Releases to update
     */
    where?: ReleaseWhereInput
  }


  /**
   * Release upsert
   */
  export type ReleaseUpsertArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * The filter to search for the Release to update in case it exists.
     */
    where: ReleaseWhereUniqueInput
    /**
     * In case the Release found by the `where` argument doesn't exist, create a new Release with this data.
     */
    create: XOR<ReleaseCreateInput, ReleaseUncheckedCreateInput>
    /**
     * In case the Release was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReleaseUpdateInput, ReleaseUncheckedUpdateInput>
  }


  /**
   * Release delete
   */
  export type ReleaseDeleteArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
    /**
     * Filter which Release to delete.
     */
    where: ReleaseWhereUniqueInput
  }


  /**
   * Release deleteMany
   */
  export type ReleaseDeleteManyArgs = {
    /**
     * Filter which Releases to delete
     */
    where?: ReleaseWhereInput
  }


  /**
   * Release.deployments
   */
  export type Release$deploymentsArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    where?: DeploymentWhereInput
    orderBy?: Enumerable<DeploymentOrderByWithRelationInput>
    cursor?: DeploymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<DeploymentScalarFieldEnum>
  }


  /**
   * Release without action
   */
  export type ReleaseArgs = {
    /**
     * Select specific fields to fetch from the Release
     */
    select?: ReleaseSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ReleaseInclude | null
  }



  /**
   * Model Deployment
   */


  export type AggregateDeployment = {
    _count: DeploymentCountAggregateOutputType | null
    _avg: DeploymentAvgAggregateOutputType | null
    _sum: DeploymentSumAggregateOutputType | null
    _min: DeploymentMinAggregateOutputType | null
    _max: DeploymentMaxAggregateOutputType | null
  }

  export type DeploymentAvgAggregateOutputType = {
    version: number | null
  }

  export type DeploymentSumAggregateOutputType = {
    version: number | null
  }

  export type DeploymentMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    appId: string | null
    version: number | null
  }

  export type DeploymentMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    appId: string | null
    version: number | null
  }

  export type DeploymentCountAggregateOutputType = {
    id: number
    createdAt: number
    appId: number
    version: number
    _all: number
  }


  export type DeploymentAvgAggregateInputType = {
    version?: true
  }

  export type DeploymentSumAggregateInputType = {
    version?: true
  }

  export type DeploymentMinAggregateInputType = {
    id?: true
    createdAt?: true
    appId?: true
    version?: true
  }

  export type DeploymentMaxAggregateInputType = {
    id?: true
    createdAt?: true
    appId?: true
    version?: true
  }

  export type DeploymentCountAggregateInputType = {
    id?: true
    createdAt?: true
    appId?: true
    version?: true
    _all?: true
  }

  export type DeploymentAggregateArgs = {
    /**
     * Filter which Deployment to aggregate.
     */
    where?: DeploymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deployments to fetch.
     */
    orderBy?: Enumerable<DeploymentOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeploymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deployments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deployments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Deployments
    **/
    _count?: true | DeploymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DeploymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DeploymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeploymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeploymentMaxAggregateInputType
  }

  export type GetDeploymentAggregateType<T extends DeploymentAggregateArgs> = {
        [P in keyof T & keyof AggregateDeployment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeployment[P]>
      : GetScalarType<T[P], AggregateDeployment[P]>
  }




  export type DeploymentGroupByArgs = {
    where?: DeploymentWhereInput
    orderBy?: Enumerable<DeploymentOrderByWithAggregationInput>
    by: DeploymentScalarFieldEnum[]
    having?: DeploymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeploymentCountAggregateInputType | true
    _avg?: DeploymentAvgAggregateInputType
    _sum?: DeploymentSumAggregateInputType
    _min?: DeploymentMinAggregateInputType
    _max?: DeploymentMaxAggregateInputType
  }


  export type DeploymentGroupByOutputType = {
    id: string
    createdAt: Date
    appId: string
    version: number
    _count: DeploymentCountAggregateOutputType | null
    _avg: DeploymentAvgAggregateOutputType | null
    _sum: DeploymentSumAggregateOutputType | null
    _min: DeploymentMinAggregateOutputType | null
    _max: DeploymentMaxAggregateOutputType | null
  }

  type GetDeploymentGroupByPayload<T extends DeploymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<DeploymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeploymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeploymentGroupByOutputType[P]>
            : GetScalarType<T[P], DeploymentGroupByOutputType[P]>
        }
      >
    >


  export type DeploymentSelect = {
    id?: boolean
    createdAt?: boolean
    appId?: boolean
    version?: boolean
    app?: boolean | AppArgs
    release?: boolean | ReleaseArgs
  }


  export type DeploymentInclude = {
    app?: boolean | AppArgs
    release?: boolean | ReleaseArgs
  }

  export type DeploymentGetPayload<S extends boolean | null | undefined | DeploymentArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Deployment :
    S extends undefined ? never :
    S extends { include: any } & (DeploymentArgs | DeploymentFindManyArgs)
    ? Deployment  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'app' ? AppGetPayload<S['include'][P]> :
        P extends 'release' ? ReleaseGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (DeploymentArgs | DeploymentFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'app' ? AppGetPayload<S['select'][P]> :
        P extends 'release' ? ReleaseGetPayload<S['select'][P]> :  P extends keyof Deployment ? Deployment[P] : never
  } 
      : Deployment


  type DeploymentCountArgs = 
    Omit<DeploymentFindManyArgs, 'select' | 'include'> & {
      select?: DeploymentCountAggregateInputType | true
    }

  export interface DeploymentDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one Deployment that matches the filter.
     * @param {DeploymentFindUniqueArgs} args - Arguments to find a Deployment
     * @example
     * // Get one Deployment
     * const deployment = await prisma.deployment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends DeploymentFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, DeploymentFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Deployment'> extends True ? Prisma__DeploymentClient<DeploymentGetPayload<T>> : Prisma__DeploymentClient<DeploymentGetPayload<T> | null, null>

    /**
     * Find one Deployment that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {DeploymentFindUniqueOrThrowArgs} args - Arguments to find a Deployment
     * @example
     * // Get one Deployment
     * const deployment = await prisma.deployment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends DeploymentFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, DeploymentFindUniqueOrThrowArgs>
    ): Prisma__DeploymentClient<DeploymentGetPayload<T>>

    /**
     * Find the first Deployment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeploymentFindFirstArgs} args - Arguments to find a Deployment
     * @example
     * // Get one Deployment
     * const deployment = await prisma.deployment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends DeploymentFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, DeploymentFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Deployment'> extends True ? Prisma__DeploymentClient<DeploymentGetPayload<T>> : Prisma__DeploymentClient<DeploymentGetPayload<T> | null, null>

    /**
     * Find the first Deployment that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeploymentFindFirstOrThrowArgs} args - Arguments to find a Deployment
     * @example
     * // Get one Deployment
     * const deployment = await prisma.deployment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends DeploymentFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DeploymentFindFirstOrThrowArgs>
    ): Prisma__DeploymentClient<DeploymentGetPayload<T>>

    /**
     * Find zero or more Deployments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeploymentFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Deployments
     * const deployments = await prisma.deployment.findMany()
     * 
     * // Get first 10 Deployments
     * const deployments = await prisma.deployment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deploymentWithIdOnly = await prisma.deployment.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends DeploymentFindManyArgs>(
      args?: SelectSubset<T, DeploymentFindManyArgs>
    ): Prisma.PrismaPromise<Array<DeploymentGetPayload<T>>>

    /**
     * Create a Deployment.
     * @param {DeploymentCreateArgs} args - Arguments to create a Deployment.
     * @example
     * // Create one Deployment
     * const Deployment = await prisma.deployment.create({
     *   data: {
     *     // ... data to create a Deployment
     *   }
     * })
     * 
    **/
    create<T extends DeploymentCreateArgs>(
      args: SelectSubset<T, DeploymentCreateArgs>
    ): Prisma__DeploymentClient<DeploymentGetPayload<T>>

    /**
     * Create many Deployments.
     *     @param {DeploymentCreateManyArgs} args - Arguments to create many Deployments.
     *     @example
     *     // Create many Deployments
     *     const deployment = await prisma.deployment.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends DeploymentCreateManyArgs>(
      args?: SelectSubset<T, DeploymentCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Deployment.
     * @param {DeploymentDeleteArgs} args - Arguments to delete one Deployment.
     * @example
     * // Delete one Deployment
     * const Deployment = await prisma.deployment.delete({
     *   where: {
     *     // ... filter to delete one Deployment
     *   }
     * })
     * 
    **/
    delete<T extends DeploymentDeleteArgs>(
      args: SelectSubset<T, DeploymentDeleteArgs>
    ): Prisma__DeploymentClient<DeploymentGetPayload<T>>

    /**
     * Update one Deployment.
     * @param {DeploymentUpdateArgs} args - Arguments to update one Deployment.
     * @example
     * // Update one Deployment
     * const deployment = await prisma.deployment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends DeploymentUpdateArgs>(
      args: SelectSubset<T, DeploymentUpdateArgs>
    ): Prisma__DeploymentClient<DeploymentGetPayload<T>>

    /**
     * Delete zero or more Deployments.
     * @param {DeploymentDeleteManyArgs} args - Arguments to filter Deployments to delete.
     * @example
     * // Delete a few Deployments
     * const { count } = await prisma.deployment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends DeploymentDeleteManyArgs>(
      args?: SelectSubset<T, DeploymentDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Deployments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeploymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Deployments
     * const deployment = await prisma.deployment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends DeploymentUpdateManyArgs>(
      args: SelectSubset<T, DeploymentUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Deployment.
     * @param {DeploymentUpsertArgs} args - Arguments to update or create a Deployment.
     * @example
     * // Update or create a Deployment
     * const deployment = await prisma.deployment.upsert({
     *   create: {
     *     // ... data to create a Deployment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Deployment we want to update
     *   }
     * })
    **/
    upsert<T extends DeploymentUpsertArgs>(
      args: SelectSubset<T, DeploymentUpsertArgs>
    ): Prisma__DeploymentClient<DeploymentGetPayload<T>>

    /**
     * Count the number of Deployments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeploymentCountArgs} args - Arguments to filter Deployments to count.
     * @example
     * // Count the number of Deployments
     * const count = await prisma.deployment.count({
     *   where: {
     *     // ... the filter for the Deployments we want to count
     *   }
     * })
    **/
    count<T extends DeploymentCountArgs>(
      args?: Subset<T, DeploymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeploymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Deployment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeploymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeploymentAggregateArgs>(args: Subset<T, DeploymentAggregateArgs>): Prisma.PrismaPromise<GetDeploymentAggregateType<T>>

    /**
     * Group by Deployment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeploymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeploymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeploymentGroupByArgs['orderBy'] }
        : { orderBy?: DeploymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeploymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeploymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Deployment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__DeploymentClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    app<T extends AppArgs= {}>(args?: Subset<T, AppArgs>): Prisma__AppClient<AppGetPayload<T> | Null>;

    release<T extends ReleaseArgs= {}>(args?: Subset<T, ReleaseArgs>): Prisma__ReleaseClient<ReleaseGetPayload<T> | Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Deployment base type for findUnique actions
   */
  export type DeploymentFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * Filter, which Deployment to fetch.
     */
    where: DeploymentWhereUniqueInput
  }

  /**
   * Deployment findUnique
   */
  export interface DeploymentFindUniqueArgs extends DeploymentFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Deployment findUniqueOrThrow
   */
  export type DeploymentFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * Filter, which Deployment to fetch.
     */
    where: DeploymentWhereUniqueInput
  }


  /**
   * Deployment base type for findFirst actions
   */
  export type DeploymentFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * Filter, which Deployment to fetch.
     */
    where?: DeploymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deployments to fetch.
     */
    orderBy?: Enumerable<DeploymentOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Deployments.
     */
    cursor?: DeploymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deployments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deployments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Deployments.
     */
    distinct?: Enumerable<DeploymentScalarFieldEnum>
  }

  /**
   * Deployment findFirst
   */
  export interface DeploymentFindFirstArgs extends DeploymentFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Deployment findFirstOrThrow
   */
  export type DeploymentFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * Filter, which Deployment to fetch.
     */
    where?: DeploymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deployments to fetch.
     */
    orderBy?: Enumerable<DeploymentOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Deployments.
     */
    cursor?: DeploymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deployments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deployments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Deployments.
     */
    distinct?: Enumerable<DeploymentScalarFieldEnum>
  }


  /**
   * Deployment findMany
   */
  export type DeploymentFindManyArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * Filter, which Deployments to fetch.
     */
    where?: DeploymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deployments to fetch.
     */
    orderBy?: Enumerable<DeploymentOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Deployments.
     */
    cursor?: DeploymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deployments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deployments.
     */
    skip?: number
    distinct?: Enumerable<DeploymentScalarFieldEnum>
  }


  /**
   * Deployment create
   */
  export type DeploymentCreateArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * The data needed to create a Deployment.
     */
    data: XOR<DeploymentCreateInput, DeploymentUncheckedCreateInput>
  }


  /**
   * Deployment createMany
   */
  export type DeploymentCreateManyArgs = {
    /**
     * The data used to create many Deployments.
     */
    data: Enumerable<DeploymentCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Deployment update
   */
  export type DeploymentUpdateArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * The data needed to update a Deployment.
     */
    data: XOR<DeploymentUpdateInput, DeploymentUncheckedUpdateInput>
    /**
     * Choose, which Deployment to update.
     */
    where: DeploymentWhereUniqueInput
  }


  /**
   * Deployment updateMany
   */
  export type DeploymentUpdateManyArgs = {
    /**
     * The data used to update Deployments.
     */
    data: XOR<DeploymentUpdateManyMutationInput, DeploymentUncheckedUpdateManyInput>
    /**
     * Filter which Deployments to update
     */
    where?: DeploymentWhereInput
  }


  /**
   * Deployment upsert
   */
  export type DeploymentUpsertArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * The filter to search for the Deployment to update in case it exists.
     */
    where: DeploymentWhereUniqueInput
    /**
     * In case the Deployment found by the `where` argument doesn't exist, create a new Deployment with this data.
     */
    create: XOR<DeploymentCreateInput, DeploymentUncheckedCreateInput>
    /**
     * In case the Deployment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeploymentUpdateInput, DeploymentUncheckedUpdateInput>
  }


  /**
   * Deployment delete
   */
  export type DeploymentDeleteArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
    /**
     * Filter which Deployment to delete.
     */
    where: DeploymentWhereUniqueInput
  }


  /**
   * Deployment deleteMany
   */
  export type DeploymentDeleteManyArgs = {
    /**
     * Filter which Deployments to delete
     */
    where?: DeploymentWhereInput
  }


  /**
   * Deployment without action
   */
  export type DeploymentArgs = {
    /**
     * Select specific fields to fetch from the Deployment
     */
    select?: DeploymentSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: DeploymentInclude | null
  }



  /**
   * Enums
   */

  // Based on
  // https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

  export const AppScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    editedAt: 'editedAt',
    dom: 'dom',
    public: 'public'
  };

  export type AppScalarFieldEnum = (typeof AppScalarFieldEnum)[keyof typeof AppScalarFieldEnum]


  export const DeploymentScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    appId: 'appId',
    version: 'version'
  };

  export type DeploymentScalarFieldEnum = (typeof DeploymentScalarFieldEnum)[keyof typeof DeploymentScalarFieldEnum]


  export const DomNodeAttributeScalarFieldEnum: {
    nodeId: 'nodeId',
    namespace: 'namespace',
    name: 'name',
    type: 'type',
    value: 'value'
  };

  export type DomNodeAttributeScalarFieldEnum = (typeof DomNodeAttributeScalarFieldEnum)[keyof typeof DomNodeAttributeScalarFieldEnum]


  export const DomNodeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    type: 'type',
    parentId: 'parentId',
    parentIndex: 'parentIndex',
    parentProp: 'parentProp',
    appId: 'appId'
  };

  export type DomNodeScalarFieldEnum = (typeof DomNodeScalarFieldEnum)[keyof typeof DomNodeScalarFieldEnum]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const ReleaseScalarFieldEnum: {
    description: 'description',
    createdAt: 'createdAt',
    snapshot: 'snapshot',
    appId: 'appId',
    version: 'version'
  };

  export type ReleaseScalarFieldEnum = (typeof ReleaseScalarFieldEnum)[keyof typeof ReleaseScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  /**
   * Deep Input Types
   */


  export type AppWhereInput = {
    AND?: Enumerable<AppWhereInput>
    OR?: Enumerable<AppWhereInput>
    NOT?: Enumerable<AppWhereInput>
    id?: StringFilter | string
    name?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    editedAt?: DateTimeFilter | Date | string
    dom?: JsonNullableFilter
    public?: BoolFilter | boolean
    deployments?: DeploymentListRelationFilter
    nodes?: DomNodeListRelationFilter
    releases?: ReleaseListRelationFilter
  }

  export type AppOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    editedAt?: SortOrder
    dom?: SortOrder
    public?: SortOrder
    deployments?: DeploymentOrderByRelationAggregateInput
    nodes?: DomNodeOrderByRelationAggregateInput
    releases?: ReleaseOrderByRelationAggregateInput
  }

  export type AppWhereUniqueInput = {
    id?: string
    name?: string
  }

  export type AppOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    editedAt?: SortOrder
    dom?: SortOrder
    public?: SortOrder
    _count?: AppCountOrderByAggregateInput
    _max?: AppMaxOrderByAggregateInput
    _min?: AppMinOrderByAggregateInput
  }

  export type AppScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AppScalarWhereWithAggregatesInput>
    OR?: Enumerable<AppScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AppScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    name?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    editedAt?: DateTimeWithAggregatesFilter | Date | string
    dom?: JsonNullableWithAggregatesFilter
    public?: BoolWithAggregatesFilter | boolean
  }

  export type DomNodeWhereInput = {
    AND?: Enumerable<DomNodeWhereInput>
    OR?: Enumerable<DomNodeWhereInput>
    NOT?: Enumerable<DomNodeWhereInput>
    id?: StringFilter | string
    name?: StringFilter | string
    type?: EnumDomNodeTypeFilter | DomNodeType
    parentId?: StringNullableFilter | string | null
    parentIndex?: StringNullableFilter | string | null
    parentProp?: StringNullableFilter | string | null
    appId?: StringFilter | string
    app?: XOR<AppRelationFilter, AppWhereInput>
    parent?: XOR<DomNodeRelationFilter, DomNodeWhereInput> | null
    children?: DomNodeListRelationFilter
    attributes?: DomNodeAttributeListRelationFilter
  }

  export type DomNodeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    parentId?: SortOrder
    parentIndex?: SortOrder
    parentProp?: SortOrder
    appId?: SortOrder
    app?: AppOrderByWithRelationInput
    parent?: DomNodeOrderByWithRelationInput
    children?: DomNodeOrderByRelationAggregateInput
    attributes?: DomNodeAttributeOrderByRelationAggregateInput
  }

  export type DomNodeWhereUniqueInput = {
    id?: string
    node_name_app_constraint?: DomNodeNode_name_app_constraintCompoundUniqueInput
  }

  export type DomNodeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    parentId?: SortOrder
    parentIndex?: SortOrder
    parentProp?: SortOrder
    appId?: SortOrder
    _count?: DomNodeCountOrderByAggregateInput
    _max?: DomNodeMaxOrderByAggregateInput
    _min?: DomNodeMinOrderByAggregateInput
  }

  export type DomNodeScalarWhereWithAggregatesInput = {
    AND?: Enumerable<DomNodeScalarWhereWithAggregatesInput>
    OR?: Enumerable<DomNodeScalarWhereWithAggregatesInput>
    NOT?: Enumerable<DomNodeScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    name?: StringWithAggregatesFilter | string
    type?: EnumDomNodeTypeWithAggregatesFilter | DomNodeType
    parentId?: StringNullableWithAggregatesFilter | string | null
    parentIndex?: StringNullableWithAggregatesFilter | string | null
    parentProp?: StringNullableWithAggregatesFilter | string | null
    appId?: StringWithAggregatesFilter | string
  }

  export type DomNodeAttributeWhereInput = {
    AND?: Enumerable<DomNodeAttributeWhereInput>
    OR?: Enumerable<DomNodeAttributeWhereInput>
    NOT?: Enumerable<DomNodeAttributeWhereInput>
    nodeId?: StringFilter | string
    namespace?: StringFilter | string
    name?: StringFilter | string
    type?: EnumDomNodeAttributeTypeFilter | DomNodeAttributeType
    value?: StringFilter | string
    node?: XOR<DomNodeRelationFilter, DomNodeWhereInput>
  }

  export type DomNodeAttributeOrderByWithRelationInput = {
    nodeId?: SortOrder
    namespace?: SortOrder
    name?: SortOrder
    type?: SortOrder
    value?: SortOrder
    node?: DomNodeOrderByWithRelationInput
  }

  export type DomNodeAttributeWhereUniqueInput = {
    nodeId_namespace_name?: DomNodeAttributeNodeIdNamespaceNameCompoundUniqueInput
  }

  export type DomNodeAttributeOrderByWithAggregationInput = {
    nodeId?: SortOrder
    namespace?: SortOrder
    name?: SortOrder
    type?: SortOrder
    value?: SortOrder
    _count?: DomNodeAttributeCountOrderByAggregateInput
    _max?: DomNodeAttributeMaxOrderByAggregateInput
    _min?: DomNodeAttributeMinOrderByAggregateInput
  }

  export type DomNodeAttributeScalarWhereWithAggregatesInput = {
    AND?: Enumerable<DomNodeAttributeScalarWhereWithAggregatesInput>
    OR?: Enumerable<DomNodeAttributeScalarWhereWithAggregatesInput>
    NOT?: Enumerable<DomNodeAttributeScalarWhereWithAggregatesInput>
    nodeId?: StringWithAggregatesFilter | string
    namespace?: StringWithAggregatesFilter | string
    name?: StringWithAggregatesFilter | string
    type?: EnumDomNodeAttributeTypeWithAggregatesFilter | DomNodeAttributeType
    value?: StringWithAggregatesFilter | string
  }

  export type ReleaseWhereInput = {
    AND?: Enumerable<ReleaseWhereInput>
    OR?: Enumerable<ReleaseWhereInput>
    NOT?: Enumerable<ReleaseWhereInput>
    description?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    snapshot?: BytesFilter | Buffer
    appId?: StringFilter | string
    version?: IntFilter | number
    app?: XOR<AppRelationFilter, AppWhereInput>
    deployments?: DeploymentListRelationFilter
  }

  export type ReleaseOrderByWithRelationInput = {
    description?: SortOrder
    createdAt?: SortOrder
    snapshot?: SortOrder
    appId?: SortOrder
    version?: SortOrder
    app?: AppOrderByWithRelationInput
    deployments?: DeploymentOrderByRelationAggregateInput
  }

  export type ReleaseWhereUniqueInput = {
    release_app_constraint?: ReleaseRelease_app_constraintCompoundUniqueInput
  }

  export type ReleaseOrderByWithAggregationInput = {
    description?: SortOrder
    createdAt?: SortOrder
    snapshot?: SortOrder
    appId?: SortOrder
    version?: SortOrder
    _count?: ReleaseCountOrderByAggregateInput
    _avg?: ReleaseAvgOrderByAggregateInput
    _max?: ReleaseMaxOrderByAggregateInput
    _min?: ReleaseMinOrderByAggregateInput
    _sum?: ReleaseSumOrderByAggregateInput
  }

  export type ReleaseScalarWhereWithAggregatesInput = {
    AND?: Enumerable<ReleaseScalarWhereWithAggregatesInput>
    OR?: Enumerable<ReleaseScalarWhereWithAggregatesInput>
    NOT?: Enumerable<ReleaseScalarWhereWithAggregatesInput>
    description?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    snapshot?: BytesWithAggregatesFilter | Buffer
    appId?: StringWithAggregatesFilter | string
    version?: IntWithAggregatesFilter | number
  }

  export type DeploymentWhereInput = {
    AND?: Enumerable<DeploymentWhereInput>
    OR?: Enumerable<DeploymentWhereInput>
    NOT?: Enumerable<DeploymentWhereInput>
    id?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    appId?: StringFilter | string
    version?: IntFilter | number
    app?: XOR<AppRelationFilter, AppWhereInput>
    release?: XOR<ReleaseRelationFilter, ReleaseWhereInput>
  }

  export type DeploymentOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    appId?: SortOrder
    version?: SortOrder
    app?: AppOrderByWithRelationInput
    release?: ReleaseOrderByWithRelationInput
  }

  export type DeploymentWhereUniqueInput = {
    id?: string
  }

  export type DeploymentOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    appId?: SortOrder
    version?: SortOrder
    _count?: DeploymentCountOrderByAggregateInput
    _avg?: DeploymentAvgOrderByAggregateInput
    _max?: DeploymentMaxOrderByAggregateInput
    _min?: DeploymentMinOrderByAggregateInput
    _sum?: DeploymentSumOrderByAggregateInput
  }

  export type DeploymentScalarWhereWithAggregatesInput = {
    AND?: Enumerable<DeploymentScalarWhereWithAggregatesInput>
    OR?: Enumerable<DeploymentScalarWhereWithAggregatesInput>
    NOT?: Enumerable<DeploymentScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    appId?: StringWithAggregatesFilter | string
    version?: IntWithAggregatesFilter | number
  }

  export type AppCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    deployments?: DeploymentCreateNestedManyWithoutAppInput
    nodes?: DomNodeCreateNestedManyWithoutAppInput
    releases?: ReleaseCreateNestedManyWithoutAppInput
  }

  export type AppUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    deployments?: DeploymentUncheckedCreateNestedManyWithoutAppInput
    nodes?: DomNodeUncheckedCreateNestedManyWithoutAppInput
    releases?: ReleaseUncheckedCreateNestedManyWithoutAppInput
  }

  export type AppUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    deployments?: DeploymentUpdateManyWithoutAppNestedInput
    nodes?: DomNodeUpdateManyWithoutAppNestedInput
    releases?: ReleaseUpdateManyWithoutAppNestedInput
  }

  export type AppUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    deployments?: DeploymentUncheckedUpdateManyWithoutAppNestedInput
    nodes?: DomNodeUncheckedUpdateManyWithoutAppNestedInput
    releases?: ReleaseUncheckedUpdateManyWithoutAppNestedInput
  }

  export type AppCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
  }

  export type AppUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AppUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
  }

  export type DomNodeCreateInput = {
    id?: string
    name: string
    type: DomNodeType
    parentIndex?: string | null
    parentProp?: string | null
    app: AppCreateNestedOneWithoutNodesInput
    parent?: DomNodeCreateNestedOneWithoutChildrenInput
    children?: DomNodeCreateNestedManyWithoutParentInput
    attributes?: DomNodeAttributeCreateNestedManyWithoutNodeInput
  }

  export type DomNodeUncheckedCreateInput = {
    id?: string
    name: string
    type: DomNodeType
    parentId?: string | null
    parentIndex?: string | null
    parentProp?: string | null
    appId: string
    children?: DomNodeUncheckedCreateNestedManyWithoutParentInput
    attributes?: DomNodeAttributeUncheckedCreateNestedManyWithoutNodeInput
  }

  export type DomNodeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    app?: AppUpdateOneRequiredWithoutNodesNestedInput
    parent?: DomNodeUpdateOneWithoutChildrenNestedInput
    children?: DomNodeUpdateManyWithoutParentNestedInput
    attributes?: DomNodeAttributeUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    appId?: StringFieldUpdateOperationsInput | string
    children?: DomNodeUncheckedUpdateManyWithoutParentNestedInput
    attributes?: DomNodeAttributeUncheckedUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeCreateManyInput = {
    id?: string
    name: string
    type: DomNodeType
    parentId?: string | null
    parentIndex?: string | null
    parentProp?: string | null
    appId: string
  }

  export type DomNodeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DomNodeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    appId?: StringFieldUpdateOperationsInput | string
  }

  export type DomNodeAttributeCreateInput = {
    namespace: string
    name: string
    type: DomNodeAttributeType
    value: string
    node: DomNodeCreateNestedOneWithoutAttributesInput
  }

  export type DomNodeAttributeUncheckedCreateInput = {
    nodeId: string
    namespace: string
    name: string
    type: DomNodeAttributeType
    value: string
  }

  export type DomNodeAttributeUpdateInput = {
    namespace?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeAttributeTypeFieldUpdateOperationsInput | DomNodeAttributeType
    value?: StringFieldUpdateOperationsInput | string
    node?: DomNodeUpdateOneRequiredWithoutAttributesNestedInput
  }

  export type DomNodeAttributeUncheckedUpdateInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    namespace?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeAttributeTypeFieldUpdateOperationsInput | DomNodeAttributeType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type DomNodeAttributeCreateManyInput = {
    nodeId: string
    namespace: string
    name: string
    type: DomNodeAttributeType
    value: string
  }

  export type DomNodeAttributeUpdateManyMutationInput = {
    namespace?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeAttributeTypeFieldUpdateOperationsInput | DomNodeAttributeType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type DomNodeAttributeUncheckedUpdateManyInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    namespace?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeAttributeTypeFieldUpdateOperationsInput | DomNodeAttributeType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type ReleaseCreateInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    version: number
    app: AppCreateNestedOneWithoutReleasesInput
    deployments?: DeploymentCreateNestedManyWithoutReleaseInput
  }

  export type ReleaseUncheckedCreateInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    appId: string
    version: number
    deployments?: DeploymentUncheckedCreateNestedManyWithoutReleaseInput
  }

  export type ReleaseUpdateInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    version?: IntFieldUpdateOperationsInput | number
    app?: AppUpdateOneRequiredWithoutReleasesNestedInput
    deployments?: DeploymentUpdateManyWithoutReleaseNestedInput
  }

  export type ReleaseUncheckedUpdateInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    appId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    deployments?: DeploymentUncheckedUpdateManyWithoutReleaseNestedInput
  }

  export type ReleaseCreateManyInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    appId: string
    version: number
  }

  export type ReleaseUpdateManyMutationInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    version?: IntFieldUpdateOperationsInput | number
  }

  export type ReleaseUncheckedUpdateManyInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    appId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
  }

  export type DeploymentCreateInput = {
    id?: string
    createdAt?: Date | string
    app: AppCreateNestedOneWithoutDeploymentsInput
    release: ReleaseCreateNestedOneWithoutDeploymentsInput
  }

  export type DeploymentUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    appId: string
    version: number
  }

  export type DeploymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    app?: AppUpdateOneRequiredWithoutDeploymentsNestedInput
    release?: ReleaseUpdateOneRequiredWithoutDeploymentsNestedInput
  }

  export type DeploymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
  }

  export type DeploymentCreateManyInput = {
    id?: string
    createdAt?: Date | string
    appId: string
    version: number
  }

  export type DeploymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeploymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
  }

  export type StringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    mode?: QueryMode
    not?: NestedStringFilter | string
  }

  export type DateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }
  export type JsonNullableFilter = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase>, Exclude<keyof Required<JsonNullableFilterBase>, 'path'>>,
        Required<JsonNullableFilterBase>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase>, 'path'>>

  export type JsonNullableFilterBase = {
    equals?: InputJsonValue | JsonNullValueFilter
    path?: string[]
    string_contains?: string
    string_starts_with?: string
    string_ends_with?: string
    array_contains?: InputJsonValue | null
    array_starts_with?: InputJsonValue | null
    array_ends_with?: InputJsonValue | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonNullValueFilter
  }

  export type BoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type DeploymentListRelationFilter = {
    every?: DeploymentWhereInput
    some?: DeploymentWhereInput
    none?: DeploymentWhereInput
  }

  export type DomNodeListRelationFilter = {
    every?: DomNodeWhereInput
    some?: DomNodeWhereInput
    none?: DomNodeWhereInput
  }

  export type ReleaseListRelationFilter = {
    every?: ReleaseWhereInput
    some?: ReleaseWhereInput
    none?: ReleaseWhereInput
  }

  export type DeploymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DomNodeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReleaseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AppCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    editedAt?: SortOrder
    dom?: SortOrder
    public?: SortOrder
  }

  export type AppMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    editedAt?: SortOrder
    public?: SortOrder
  }

  export type AppMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    editedAt?: SortOrder
    public?: SortOrder
  }

  export type StringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type DateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }
  export type JsonNullableWithAggregatesFilter = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase = {
    equals?: InputJsonValue | JsonNullValueFilter
    path?: string[]
    string_contains?: string
    string_starts_with?: string
    string_ends_with?: string
    array_contains?: InputJsonValue | null
    array_starts_with?: InputJsonValue | null
    array_ends_with?: InputJsonValue | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonNullValueFilter
    _count?: NestedIntNullableFilter
    _min?: NestedJsonNullableFilter
    _max?: NestedJsonNullableFilter
  }

  export type BoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type EnumDomNodeTypeFilter = {
    equals?: DomNodeType
    in?: Enumerable<DomNodeType>
    notIn?: Enumerable<DomNodeType>
    not?: NestedEnumDomNodeTypeFilter | DomNodeType
  }

  export type StringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    mode?: QueryMode
    not?: NestedStringNullableFilter | string | null
  }

  export type AppRelationFilter = {
    is?: AppWhereInput
    isNot?: AppWhereInput
  }

  export type DomNodeRelationFilter = {
    is?: DomNodeWhereInput | null
    isNot?: DomNodeWhereInput | null
  }

  export type DomNodeAttributeListRelationFilter = {
    every?: DomNodeAttributeWhereInput
    some?: DomNodeAttributeWhereInput
    none?: DomNodeAttributeWhereInput
  }

  export type DomNodeAttributeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DomNodeNode_name_app_constraintCompoundUniqueInput = {
    appId: string
    name: string
  }

  export type DomNodeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    parentId?: SortOrder
    parentIndex?: SortOrder
    parentProp?: SortOrder
    appId?: SortOrder
  }

  export type DomNodeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    parentId?: SortOrder
    parentIndex?: SortOrder
    parentProp?: SortOrder
    appId?: SortOrder
  }

  export type DomNodeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    parentId?: SortOrder
    parentIndex?: SortOrder
    parentProp?: SortOrder
    appId?: SortOrder
  }

  export type EnumDomNodeTypeWithAggregatesFilter = {
    equals?: DomNodeType
    in?: Enumerable<DomNodeType>
    notIn?: Enumerable<DomNodeType>
    not?: NestedEnumDomNodeTypeWithAggregatesFilter | DomNodeType
    _count?: NestedIntFilter
    _min?: NestedEnumDomNodeTypeFilter
    _max?: NestedEnumDomNodeTypeFilter
  }

  export type StringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type EnumDomNodeAttributeTypeFilter = {
    equals?: DomNodeAttributeType
    in?: Enumerable<DomNodeAttributeType>
    notIn?: Enumerable<DomNodeAttributeType>
    not?: NestedEnumDomNodeAttributeTypeFilter | DomNodeAttributeType
  }

  export type DomNodeAttributeNodeIdNamespaceNameCompoundUniqueInput = {
    nodeId: string
    namespace: string
    name: string
  }

  export type DomNodeAttributeCountOrderByAggregateInput = {
    nodeId?: SortOrder
    namespace?: SortOrder
    name?: SortOrder
    type?: SortOrder
    value?: SortOrder
  }

  export type DomNodeAttributeMaxOrderByAggregateInput = {
    nodeId?: SortOrder
    namespace?: SortOrder
    name?: SortOrder
    type?: SortOrder
    value?: SortOrder
  }

  export type DomNodeAttributeMinOrderByAggregateInput = {
    nodeId?: SortOrder
    namespace?: SortOrder
    name?: SortOrder
    type?: SortOrder
    value?: SortOrder
  }

  export type EnumDomNodeAttributeTypeWithAggregatesFilter = {
    equals?: DomNodeAttributeType
    in?: Enumerable<DomNodeAttributeType>
    notIn?: Enumerable<DomNodeAttributeType>
    not?: NestedEnumDomNodeAttributeTypeWithAggregatesFilter | DomNodeAttributeType
    _count?: NestedIntFilter
    _min?: NestedEnumDomNodeAttributeTypeFilter
    _max?: NestedEnumDomNodeAttributeTypeFilter
  }

  export type BytesFilter = {
    equals?: Buffer
    in?: Enumerable<Buffer>
    notIn?: Enumerable<Buffer>
    not?: NestedBytesFilter | Buffer
  }

  export type IntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type ReleaseRelease_app_constraintCompoundUniqueInput = {
    version: number
    appId: string
  }

  export type ReleaseCountOrderByAggregateInput = {
    description?: SortOrder
    createdAt?: SortOrder
    snapshot?: SortOrder
    appId?: SortOrder
    version?: SortOrder
  }

  export type ReleaseAvgOrderByAggregateInput = {
    version?: SortOrder
  }

  export type ReleaseMaxOrderByAggregateInput = {
    description?: SortOrder
    createdAt?: SortOrder
    snapshot?: SortOrder
    appId?: SortOrder
    version?: SortOrder
  }

  export type ReleaseMinOrderByAggregateInput = {
    description?: SortOrder
    createdAt?: SortOrder
    snapshot?: SortOrder
    appId?: SortOrder
    version?: SortOrder
  }

  export type ReleaseSumOrderByAggregateInput = {
    version?: SortOrder
  }

  export type BytesWithAggregatesFilter = {
    equals?: Buffer
    in?: Enumerable<Buffer>
    notIn?: Enumerable<Buffer>
    not?: NestedBytesWithAggregatesFilter | Buffer
    _count?: NestedIntFilter
    _min?: NestedBytesFilter
    _max?: NestedBytesFilter
  }

  export type IntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type ReleaseRelationFilter = {
    is?: ReleaseWhereInput
    isNot?: ReleaseWhereInput
  }

  export type DeploymentCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    appId?: SortOrder
    version?: SortOrder
  }

  export type DeploymentAvgOrderByAggregateInput = {
    version?: SortOrder
  }

  export type DeploymentMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    appId?: SortOrder
    version?: SortOrder
  }

  export type DeploymentMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    appId?: SortOrder
    version?: SortOrder
  }

  export type DeploymentSumOrderByAggregateInput = {
    version?: SortOrder
  }

  export type DeploymentCreateNestedManyWithoutAppInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutAppInput>, Enumerable<DeploymentUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutAppInput>
    createMany?: DeploymentCreateManyAppInputEnvelope
    connect?: Enumerable<DeploymentWhereUniqueInput>
  }

  export type DomNodeCreateNestedManyWithoutAppInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutAppInput>, Enumerable<DomNodeUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutAppInput>
    createMany?: DomNodeCreateManyAppInputEnvelope
    connect?: Enumerable<DomNodeWhereUniqueInput>
  }

  export type ReleaseCreateNestedManyWithoutAppInput = {
    create?: XOR<Enumerable<ReleaseCreateWithoutAppInput>, Enumerable<ReleaseUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<ReleaseCreateOrConnectWithoutAppInput>
    createMany?: ReleaseCreateManyAppInputEnvelope
    connect?: Enumerable<ReleaseWhereUniqueInput>
  }

  export type DeploymentUncheckedCreateNestedManyWithoutAppInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutAppInput>, Enumerable<DeploymentUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutAppInput>
    createMany?: DeploymentCreateManyAppInputEnvelope
    connect?: Enumerable<DeploymentWhereUniqueInput>
  }

  export type DomNodeUncheckedCreateNestedManyWithoutAppInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutAppInput>, Enumerable<DomNodeUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutAppInput>
    createMany?: DomNodeCreateManyAppInputEnvelope
    connect?: Enumerable<DomNodeWhereUniqueInput>
  }

  export type ReleaseUncheckedCreateNestedManyWithoutAppInput = {
    create?: XOR<Enumerable<ReleaseCreateWithoutAppInput>, Enumerable<ReleaseUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<ReleaseCreateOrConnectWithoutAppInput>
    createMany?: ReleaseCreateManyAppInputEnvelope
    connect?: Enumerable<ReleaseWhereUniqueInput>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DeploymentUpdateManyWithoutAppNestedInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutAppInput>, Enumerable<DeploymentUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutAppInput>
    upsert?: Enumerable<DeploymentUpsertWithWhereUniqueWithoutAppInput>
    createMany?: DeploymentCreateManyAppInputEnvelope
    set?: Enumerable<DeploymentWhereUniqueInput>
    disconnect?: Enumerable<DeploymentWhereUniqueInput>
    delete?: Enumerable<DeploymentWhereUniqueInput>
    connect?: Enumerable<DeploymentWhereUniqueInput>
    update?: Enumerable<DeploymentUpdateWithWhereUniqueWithoutAppInput>
    updateMany?: Enumerable<DeploymentUpdateManyWithWhereWithoutAppInput>
    deleteMany?: Enumerable<DeploymentScalarWhereInput>
  }

  export type DomNodeUpdateManyWithoutAppNestedInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutAppInput>, Enumerable<DomNodeUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutAppInput>
    upsert?: Enumerable<DomNodeUpsertWithWhereUniqueWithoutAppInput>
    createMany?: DomNodeCreateManyAppInputEnvelope
    set?: Enumerable<DomNodeWhereUniqueInput>
    disconnect?: Enumerable<DomNodeWhereUniqueInput>
    delete?: Enumerable<DomNodeWhereUniqueInput>
    connect?: Enumerable<DomNodeWhereUniqueInput>
    update?: Enumerable<DomNodeUpdateWithWhereUniqueWithoutAppInput>
    updateMany?: Enumerable<DomNodeUpdateManyWithWhereWithoutAppInput>
    deleteMany?: Enumerable<DomNodeScalarWhereInput>
  }

  export type ReleaseUpdateManyWithoutAppNestedInput = {
    create?: XOR<Enumerable<ReleaseCreateWithoutAppInput>, Enumerable<ReleaseUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<ReleaseCreateOrConnectWithoutAppInput>
    upsert?: Enumerable<ReleaseUpsertWithWhereUniqueWithoutAppInput>
    createMany?: ReleaseCreateManyAppInputEnvelope
    set?: Enumerable<ReleaseWhereUniqueInput>
    disconnect?: Enumerable<ReleaseWhereUniqueInput>
    delete?: Enumerable<ReleaseWhereUniqueInput>
    connect?: Enumerable<ReleaseWhereUniqueInput>
    update?: Enumerable<ReleaseUpdateWithWhereUniqueWithoutAppInput>
    updateMany?: Enumerable<ReleaseUpdateManyWithWhereWithoutAppInput>
    deleteMany?: Enumerable<ReleaseScalarWhereInput>
  }

  export type DeploymentUncheckedUpdateManyWithoutAppNestedInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutAppInput>, Enumerable<DeploymentUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutAppInput>
    upsert?: Enumerable<DeploymentUpsertWithWhereUniqueWithoutAppInput>
    createMany?: DeploymentCreateManyAppInputEnvelope
    set?: Enumerable<DeploymentWhereUniqueInput>
    disconnect?: Enumerable<DeploymentWhereUniqueInput>
    delete?: Enumerable<DeploymentWhereUniqueInput>
    connect?: Enumerable<DeploymentWhereUniqueInput>
    update?: Enumerable<DeploymentUpdateWithWhereUniqueWithoutAppInput>
    updateMany?: Enumerable<DeploymentUpdateManyWithWhereWithoutAppInput>
    deleteMany?: Enumerable<DeploymentScalarWhereInput>
  }

  export type DomNodeUncheckedUpdateManyWithoutAppNestedInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutAppInput>, Enumerable<DomNodeUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutAppInput>
    upsert?: Enumerable<DomNodeUpsertWithWhereUniqueWithoutAppInput>
    createMany?: DomNodeCreateManyAppInputEnvelope
    set?: Enumerable<DomNodeWhereUniqueInput>
    disconnect?: Enumerable<DomNodeWhereUniqueInput>
    delete?: Enumerable<DomNodeWhereUniqueInput>
    connect?: Enumerable<DomNodeWhereUniqueInput>
    update?: Enumerable<DomNodeUpdateWithWhereUniqueWithoutAppInput>
    updateMany?: Enumerable<DomNodeUpdateManyWithWhereWithoutAppInput>
    deleteMany?: Enumerable<DomNodeScalarWhereInput>
  }

  export type ReleaseUncheckedUpdateManyWithoutAppNestedInput = {
    create?: XOR<Enumerable<ReleaseCreateWithoutAppInput>, Enumerable<ReleaseUncheckedCreateWithoutAppInput>>
    connectOrCreate?: Enumerable<ReleaseCreateOrConnectWithoutAppInput>
    upsert?: Enumerable<ReleaseUpsertWithWhereUniqueWithoutAppInput>
    createMany?: ReleaseCreateManyAppInputEnvelope
    set?: Enumerable<ReleaseWhereUniqueInput>
    disconnect?: Enumerable<ReleaseWhereUniqueInput>
    delete?: Enumerable<ReleaseWhereUniqueInput>
    connect?: Enumerable<ReleaseWhereUniqueInput>
    update?: Enumerable<ReleaseUpdateWithWhereUniqueWithoutAppInput>
    updateMany?: Enumerable<ReleaseUpdateManyWithWhereWithoutAppInput>
    deleteMany?: Enumerable<ReleaseScalarWhereInput>
  }

  export type AppCreateNestedOneWithoutNodesInput = {
    create?: XOR<AppCreateWithoutNodesInput, AppUncheckedCreateWithoutNodesInput>
    connectOrCreate?: AppCreateOrConnectWithoutNodesInput
    connect?: AppWhereUniqueInput
  }

  export type DomNodeCreateNestedOneWithoutChildrenInput = {
    create?: XOR<DomNodeCreateWithoutChildrenInput, DomNodeUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: DomNodeCreateOrConnectWithoutChildrenInput
    connect?: DomNodeWhereUniqueInput
  }

  export type DomNodeCreateNestedManyWithoutParentInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutParentInput>, Enumerable<DomNodeUncheckedCreateWithoutParentInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutParentInput>
    createMany?: DomNodeCreateManyParentInputEnvelope
    connect?: Enumerable<DomNodeWhereUniqueInput>
  }

  export type DomNodeAttributeCreateNestedManyWithoutNodeInput = {
    create?: XOR<Enumerable<DomNodeAttributeCreateWithoutNodeInput>, Enumerable<DomNodeAttributeUncheckedCreateWithoutNodeInput>>
    connectOrCreate?: Enumerable<DomNodeAttributeCreateOrConnectWithoutNodeInput>
    createMany?: DomNodeAttributeCreateManyNodeInputEnvelope
    connect?: Enumerable<DomNodeAttributeWhereUniqueInput>
  }

  export type DomNodeUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutParentInput>, Enumerable<DomNodeUncheckedCreateWithoutParentInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutParentInput>
    createMany?: DomNodeCreateManyParentInputEnvelope
    connect?: Enumerable<DomNodeWhereUniqueInput>
  }

  export type DomNodeAttributeUncheckedCreateNestedManyWithoutNodeInput = {
    create?: XOR<Enumerable<DomNodeAttributeCreateWithoutNodeInput>, Enumerable<DomNodeAttributeUncheckedCreateWithoutNodeInput>>
    connectOrCreate?: Enumerable<DomNodeAttributeCreateOrConnectWithoutNodeInput>
    createMany?: DomNodeAttributeCreateManyNodeInputEnvelope
    connect?: Enumerable<DomNodeAttributeWhereUniqueInput>
  }

  export type EnumDomNodeTypeFieldUpdateOperationsInput = {
    set?: DomNodeType
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type AppUpdateOneRequiredWithoutNodesNestedInput = {
    create?: XOR<AppCreateWithoutNodesInput, AppUncheckedCreateWithoutNodesInput>
    connectOrCreate?: AppCreateOrConnectWithoutNodesInput
    upsert?: AppUpsertWithoutNodesInput
    connect?: AppWhereUniqueInput
    update?: XOR<AppUpdateWithoutNodesInput, AppUncheckedUpdateWithoutNodesInput>
  }

  export type DomNodeUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<DomNodeCreateWithoutChildrenInput, DomNodeUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: DomNodeCreateOrConnectWithoutChildrenInput
    upsert?: DomNodeUpsertWithoutChildrenInput
    disconnect?: boolean
    delete?: boolean
    connect?: DomNodeWhereUniqueInput
    update?: XOR<DomNodeUpdateWithoutChildrenInput, DomNodeUncheckedUpdateWithoutChildrenInput>
  }

  export type DomNodeUpdateManyWithoutParentNestedInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutParentInput>, Enumerable<DomNodeUncheckedCreateWithoutParentInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutParentInput>
    upsert?: Enumerable<DomNodeUpsertWithWhereUniqueWithoutParentInput>
    createMany?: DomNodeCreateManyParentInputEnvelope
    set?: Enumerable<DomNodeWhereUniqueInput>
    disconnect?: Enumerable<DomNodeWhereUniqueInput>
    delete?: Enumerable<DomNodeWhereUniqueInput>
    connect?: Enumerable<DomNodeWhereUniqueInput>
    update?: Enumerable<DomNodeUpdateWithWhereUniqueWithoutParentInput>
    updateMany?: Enumerable<DomNodeUpdateManyWithWhereWithoutParentInput>
    deleteMany?: Enumerable<DomNodeScalarWhereInput>
  }

  export type DomNodeAttributeUpdateManyWithoutNodeNestedInput = {
    create?: XOR<Enumerable<DomNodeAttributeCreateWithoutNodeInput>, Enumerable<DomNodeAttributeUncheckedCreateWithoutNodeInput>>
    connectOrCreate?: Enumerable<DomNodeAttributeCreateOrConnectWithoutNodeInput>
    upsert?: Enumerable<DomNodeAttributeUpsertWithWhereUniqueWithoutNodeInput>
    createMany?: DomNodeAttributeCreateManyNodeInputEnvelope
    set?: Enumerable<DomNodeAttributeWhereUniqueInput>
    disconnect?: Enumerable<DomNodeAttributeWhereUniqueInput>
    delete?: Enumerable<DomNodeAttributeWhereUniqueInput>
    connect?: Enumerable<DomNodeAttributeWhereUniqueInput>
    update?: Enumerable<DomNodeAttributeUpdateWithWhereUniqueWithoutNodeInput>
    updateMany?: Enumerable<DomNodeAttributeUpdateManyWithWhereWithoutNodeInput>
    deleteMany?: Enumerable<DomNodeAttributeScalarWhereInput>
  }

  export type DomNodeUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<Enumerable<DomNodeCreateWithoutParentInput>, Enumerable<DomNodeUncheckedCreateWithoutParentInput>>
    connectOrCreate?: Enumerable<DomNodeCreateOrConnectWithoutParentInput>
    upsert?: Enumerable<DomNodeUpsertWithWhereUniqueWithoutParentInput>
    createMany?: DomNodeCreateManyParentInputEnvelope
    set?: Enumerable<DomNodeWhereUniqueInput>
    disconnect?: Enumerable<DomNodeWhereUniqueInput>
    delete?: Enumerable<DomNodeWhereUniqueInput>
    connect?: Enumerable<DomNodeWhereUniqueInput>
    update?: Enumerable<DomNodeUpdateWithWhereUniqueWithoutParentInput>
    updateMany?: Enumerable<DomNodeUpdateManyWithWhereWithoutParentInput>
    deleteMany?: Enumerable<DomNodeScalarWhereInput>
  }

  export type DomNodeAttributeUncheckedUpdateManyWithoutNodeNestedInput = {
    create?: XOR<Enumerable<DomNodeAttributeCreateWithoutNodeInput>, Enumerable<DomNodeAttributeUncheckedCreateWithoutNodeInput>>
    connectOrCreate?: Enumerable<DomNodeAttributeCreateOrConnectWithoutNodeInput>
    upsert?: Enumerable<DomNodeAttributeUpsertWithWhereUniqueWithoutNodeInput>
    createMany?: DomNodeAttributeCreateManyNodeInputEnvelope
    set?: Enumerable<DomNodeAttributeWhereUniqueInput>
    disconnect?: Enumerable<DomNodeAttributeWhereUniqueInput>
    delete?: Enumerable<DomNodeAttributeWhereUniqueInput>
    connect?: Enumerable<DomNodeAttributeWhereUniqueInput>
    update?: Enumerable<DomNodeAttributeUpdateWithWhereUniqueWithoutNodeInput>
    updateMany?: Enumerable<DomNodeAttributeUpdateManyWithWhereWithoutNodeInput>
    deleteMany?: Enumerable<DomNodeAttributeScalarWhereInput>
  }

  export type DomNodeCreateNestedOneWithoutAttributesInput = {
    create?: XOR<DomNodeCreateWithoutAttributesInput, DomNodeUncheckedCreateWithoutAttributesInput>
    connectOrCreate?: DomNodeCreateOrConnectWithoutAttributesInput
    connect?: DomNodeWhereUniqueInput
  }

  export type EnumDomNodeAttributeTypeFieldUpdateOperationsInput = {
    set?: DomNodeAttributeType
  }

  export type DomNodeUpdateOneRequiredWithoutAttributesNestedInput = {
    create?: XOR<DomNodeCreateWithoutAttributesInput, DomNodeUncheckedCreateWithoutAttributesInput>
    connectOrCreate?: DomNodeCreateOrConnectWithoutAttributesInput
    upsert?: DomNodeUpsertWithoutAttributesInput
    connect?: DomNodeWhereUniqueInput
    update?: XOR<DomNodeUpdateWithoutAttributesInput, DomNodeUncheckedUpdateWithoutAttributesInput>
  }

  export type AppCreateNestedOneWithoutReleasesInput = {
    create?: XOR<AppCreateWithoutReleasesInput, AppUncheckedCreateWithoutReleasesInput>
    connectOrCreate?: AppCreateOrConnectWithoutReleasesInput
    connect?: AppWhereUniqueInput
  }

  export type DeploymentCreateNestedManyWithoutReleaseInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutReleaseInput>, Enumerable<DeploymentUncheckedCreateWithoutReleaseInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutReleaseInput>
    createMany?: DeploymentCreateManyReleaseInputEnvelope
    connect?: Enumerable<DeploymentWhereUniqueInput>
  }

  export type DeploymentUncheckedCreateNestedManyWithoutReleaseInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutReleaseInput>, Enumerable<DeploymentUncheckedCreateWithoutReleaseInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutReleaseInput>
    createMany?: DeploymentCreateManyReleaseInputEnvelope
    connect?: Enumerable<DeploymentWhereUniqueInput>
  }

  export type BytesFieldUpdateOperationsInput = {
    set?: Buffer
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AppUpdateOneRequiredWithoutReleasesNestedInput = {
    create?: XOR<AppCreateWithoutReleasesInput, AppUncheckedCreateWithoutReleasesInput>
    connectOrCreate?: AppCreateOrConnectWithoutReleasesInput
    upsert?: AppUpsertWithoutReleasesInput
    connect?: AppWhereUniqueInput
    update?: XOR<AppUpdateWithoutReleasesInput, AppUncheckedUpdateWithoutReleasesInput>
  }

  export type DeploymentUpdateManyWithoutReleaseNestedInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutReleaseInput>, Enumerable<DeploymentUncheckedCreateWithoutReleaseInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutReleaseInput>
    upsert?: Enumerable<DeploymentUpsertWithWhereUniqueWithoutReleaseInput>
    createMany?: DeploymentCreateManyReleaseInputEnvelope
    set?: Enumerable<DeploymentWhereUniqueInput>
    disconnect?: Enumerable<DeploymentWhereUniqueInput>
    delete?: Enumerable<DeploymentWhereUniqueInput>
    connect?: Enumerable<DeploymentWhereUniqueInput>
    update?: Enumerable<DeploymentUpdateWithWhereUniqueWithoutReleaseInput>
    updateMany?: Enumerable<DeploymentUpdateManyWithWhereWithoutReleaseInput>
    deleteMany?: Enumerable<DeploymentScalarWhereInput>
  }

  export type DeploymentUncheckedUpdateManyWithoutReleaseNestedInput = {
    create?: XOR<Enumerable<DeploymentCreateWithoutReleaseInput>, Enumerable<DeploymentUncheckedCreateWithoutReleaseInput>>
    connectOrCreate?: Enumerable<DeploymentCreateOrConnectWithoutReleaseInput>
    upsert?: Enumerable<DeploymentUpsertWithWhereUniqueWithoutReleaseInput>
    createMany?: DeploymentCreateManyReleaseInputEnvelope
    set?: Enumerable<DeploymentWhereUniqueInput>
    disconnect?: Enumerable<DeploymentWhereUniqueInput>
    delete?: Enumerable<DeploymentWhereUniqueInput>
    connect?: Enumerable<DeploymentWhereUniqueInput>
    update?: Enumerable<DeploymentUpdateWithWhereUniqueWithoutReleaseInput>
    updateMany?: Enumerable<DeploymentUpdateManyWithWhereWithoutReleaseInput>
    deleteMany?: Enumerable<DeploymentScalarWhereInput>
  }

  export type AppCreateNestedOneWithoutDeploymentsInput = {
    create?: XOR<AppCreateWithoutDeploymentsInput, AppUncheckedCreateWithoutDeploymentsInput>
    connectOrCreate?: AppCreateOrConnectWithoutDeploymentsInput
    connect?: AppWhereUniqueInput
  }

  export type ReleaseCreateNestedOneWithoutDeploymentsInput = {
    create?: XOR<ReleaseCreateWithoutDeploymentsInput, ReleaseUncheckedCreateWithoutDeploymentsInput>
    connectOrCreate?: ReleaseCreateOrConnectWithoutDeploymentsInput
    connect?: ReleaseWhereUniqueInput
  }

  export type AppUpdateOneRequiredWithoutDeploymentsNestedInput = {
    create?: XOR<AppCreateWithoutDeploymentsInput, AppUncheckedCreateWithoutDeploymentsInput>
    connectOrCreate?: AppCreateOrConnectWithoutDeploymentsInput
    upsert?: AppUpsertWithoutDeploymentsInput
    connect?: AppWhereUniqueInput
    update?: XOR<AppUpdateWithoutDeploymentsInput, AppUncheckedUpdateWithoutDeploymentsInput>
  }

  export type ReleaseUpdateOneRequiredWithoutDeploymentsNestedInput = {
    create?: XOR<ReleaseCreateWithoutDeploymentsInput, ReleaseUncheckedCreateWithoutDeploymentsInput>
    connectOrCreate?: ReleaseCreateOrConnectWithoutDeploymentsInput
    upsert?: ReleaseUpsertWithoutDeploymentsInput
    connect?: ReleaseWhereUniqueInput
    update?: XOR<ReleaseUpdateWithoutDeploymentsInput, ReleaseUncheckedUpdateWithoutDeploymentsInput>
  }

  export type NestedStringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type NestedDateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type NestedBoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type NestedStringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type NestedIntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type NestedDateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type NestedIntNullableFilter = {
    equals?: number | null
    in?: Enumerable<number> | null
    notIn?: Enumerable<number> | null
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntNullableFilter | number | null
  }
  export type NestedJsonNullableFilter = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase>, Exclude<keyof Required<NestedJsonNullableFilterBase>, 'path'>>,
        Required<NestedJsonNullableFilterBase>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase>, 'path'>>

  export type NestedJsonNullableFilterBase = {
    equals?: InputJsonValue | JsonNullValueFilter
    path?: string[]
    string_contains?: string
    string_starts_with?: string
    string_ends_with?: string
    array_contains?: InputJsonValue | null
    array_starts_with?: InputJsonValue | null
    array_ends_with?: InputJsonValue | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type NestedEnumDomNodeTypeFilter = {
    equals?: DomNodeType
    in?: Enumerable<DomNodeType>
    notIn?: Enumerable<DomNodeType>
    not?: NestedEnumDomNodeTypeFilter | DomNodeType
  }

  export type NestedStringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableFilter | string | null
  }

  export type NestedEnumDomNodeTypeWithAggregatesFilter = {
    equals?: DomNodeType
    in?: Enumerable<DomNodeType>
    notIn?: Enumerable<DomNodeType>
    not?: NestedEnumDomNodeTypeWithAggregatesFilter | DomNodeType
    _count?: NestedIntFilter
    _min?: NestedEnumDomNodeTypeFilter
    _max?: NestedEnumDomNodeTypeFilter
  }

  export type NestedStringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type NestedEnumDomNodeAttributeTypeFilter = {
    equals?: DomNodeAttributeType
    in?: Enumerable<DomNodeAttributeType>
    notIn?: Enumerable<DomNodeAttributeType>
    not?: NestedEnumDomNodeAttributeTypeFilter | DomNodeAttributeType
  }

  export type NestedEnumDomNodeAttributeTypeWithAggregatesFilter = {
    equals?: DomNodeAttributeType
    in?: Enumerable<DomNodeAttributeType>
    notIn?: Enumerable<DomNodeAttributeType>
    not?: NestedEnumDomNodeAttributeTypeWithAggregatesFilter | DomNodeAttributeType
    _count?: NestedIntFilter
    _min?: NestedEnumDomNodeAttributeTypeFilter
    _max?: NestedEnumDomNodeAttributeTypeFilter
  }

  export type NestedBytesFilter = {
    equals?: Buffer
    in?: Enumerable<Buffer>
    notIn?: Enumerable<Buffer>
    not?: NestedBytesFilter | Buffer
  }

  export type NestedBytesWithAggregatesFilter = {
    equals?: Buffer
    in?: Enumerable<Buffer>
    notIn?: Enumerable<Buffer>
    not?: NestedBytesWithAggregatesFilter | Buffer
    _count?: NestedIntFilter
    _min?: NestedBytesFilter
    _max?: NestedBytesFilter
  }

  export type NestedIntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type NestedFloatFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedFloatFilter | number
  }

  export type DeploymentCreateWithoutAppInput = {
    id?: string
    createdAt?: Date | string
    release: ReleaseCreateNestedOneWithoutDeploymentsInput
  }

  export type DeploymentUncheckedCreateWithoutAppInput = {
    id?: string
    createdAt?: Date | string
    version: number
  }

  export type DeploymentCreateOrConnectWithoutAppInput = {
    where: DeploymentWhereUniqueInput
    create: XOR<DeploymentCreateWithoutAppInput, DeploymentUncheckedCreateWithoutAppInput>
  }

  export type DeploymentCreateManyAppInputEnvelope = {
    data: Enumerable<DeploymentCreateManyAppInput>
    skipDuplicates?: boolean
  }

  export type DomNodeCreateWithoutAppInput = {
    id?: string
    name: string
    type: DomNodeType
    parentIndex?: string | null
    parentProp?: string | null
    parent?: DomNodeCreateNestedOneWithoutChildrenInput
    children?: DomNodeCreateNestedManyWithoutParentInput
    attributes?: DomNodeAttributeCreateNestedManyWithoutNodeInput
  }

  export type DomNodeUncheckedCreateWithoutAppInput = {
    id?: string
    name: string
    type: DomNodeType
    parentId?: string | null
    parentIndex?: string | null
    parentProp?: string | null
    children?: DomNodeUncheckedCreateNestedManyWithoutParentInput
    attributes?: DomNodeAttributeUncheckedCreateNestedManyWithoutNodeInput
  }

  export type DomNodeCreateOrConnectWithoutAppInput = {
    where: DomNodeWhereUniqueInput
    create: XOR<DomNodeCreateWithoutAppInput, DomNodeUncheckedCreateWithoutAppInput>
  }

  export type DomNodeCreateManyAppInputEnvelope = {
    data: Enumerable<DomNodeCreateManyAppInput>
    skipDuplicates?: boolean
  }

  export type ReleaseCreateWithoutAppInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    version: number
    deployments?: DeploymentCreateNestedManyWithoutReleaseInput
  }

  export type ReleaseUncheckedCreateWithoutAppInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    version: number
    deployments?: DeploymentUncheckedCreateNestedManyWithoutReleaseInput
  }

  export type ReleaseCreateOrConnectWithoutAppInput = {
    where: ReleaseWhereUniqueInput
    create: XOR<ReleaseCreateWithoutAppInput, ReleaseUncheckedCreateWithoutAppInput>
  }

  export type ReleaseCreateManyAppInputEnvelope = {
    data: Enumerable<ReleaseCreateManyAppInput>
    skipDuplicates?: boolean
  }

  export type DeploymentUpsertWithWhereUniqueWithoutAppInput = {
    where: DeploymentWhereUniqueInput
    update: XOR<DeploymentUpdateWithoutAppInput, DeploymentUncheckedUpdateWithoutAppInput>
    create: XOR<DeploymentCreateWithoutAppInput, DeploymentUncheckedCreateWithoutAppInput>
  }

  export type DeploymentUpdateWithWhereUniqueWithoutAppInput = {
    where: DeploymentWhereUniqueInput
    data: XOR<DeploymentUpdateWithoutAppInput, DeploymentUncheckedUpdateWithoutAppInput>
  }

  export type DeploymentUpdateManyWithWhereWithoutAppInput = {
    where: DeploymentScalarWhereInput
    data: XOR<DeploymentUpdateManyMutationInput, DeploymentUncheckedUpdateManyWithoutDeploymentsInput>
  }

  export type DeploymentScalarWhereInput = {
    AND?: Enumerable<DeploymentScalarWhereInput>
    OR?: Enumerable<DeploymentScalarWhereInput>
    NOT?: Enumerable<DeploymentScalarWhereInput>
    id?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    appId?: StringFilter | string
    version?: IntFilter | number
  }

  export type DomNodeUpsertWithWhereUniqueWithoutAppInput = {
    where: DomNodeWhereUniqueInput
    update: XOR<DomNodeUpdateWithoutAppInput, DomNodeUncheckedUpdateWithoutAppInput>
    create: XOR<DomNodeCreateWithoutAppInput, DomNodeUncheckedCreateWithoutAppInput>
  }

  export type DomNodeUpdateWithWhereUniqueWithoutAppInput = {
    where: DomNodeWhereUniqueInput
    data: XOR<DomNodeUpdateWithoutAppInput, DomNodeUncheckedUpdateWithoutAppInput>
  }

  export type DomNodeUpdateManyWithWhereWithoutAppInput = {
    where: DomNodeScalarWhereInput
    data: XOR<DomNodeUpdateManyMutationInput, DomNodeUncheckedUpdateManyWithoutNodesInput>
  }

  export type DomNodeScalarWhereInput = {
    AND?: Enumerable<DomNodeScalarWhereInput>
    OR?: Enumerable<DomNodeScalarWhereInput>
    NOT?: Enumerable<DomNodeScalarWhereInput>
    id?: StringFilter | string
    name?: StringFilter | string
    type?: EnumDomNodeTypeFilter | DomNodeType
    parentId?: StringNullableFilter | string | null
    parentIndex?: StringNullableFilter | string | null
    parentProp?: StringNullableFilter | string | null
    appId?: StringFilter | string
  }

  export type ReleaseUpsertWithWhereUniqueWithoutAppInput = {
    where: ReleaseWhereUniqueInput
    update: XOR<ReleaseUpdateWithoutAppInput, ReleaseUncheckedUpdateWithoutAppInput>
    create: XOR<ReleaseCreateWithoutAppInput, ReleaseUncheckedCreateWithoutAppInput>
  }

  export type ReleaseUpdateWithWhereUniqueWithoutAppInput = {
    where: ReleaseWhereUniqueInput
    data: XOR<ReleaseUpdateWithoutAppInput, ReleaseUncheckedUpdateWithoutAppInput>
  }

  export type ReleaseUpdateManyWithWhereWithoutAppInput = {
    where: ReleaseScalarWhereInput
    data: XOR<ReleaseUpdateManyMutationInput, ReleaseUncheckedUpdateManyWithoutReleasesInput>
  }

  export type ReleaseScalarWhereInput = {
    AND?: Enumerable<ReleaseScalarWhereInput>
    OR?: Enumerable<ReleaseScalarWhereInput>
    NOT?: Enumerable<ReleaseScalarWhereInput>
    description?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    snapshot?: BytesFilter | Buffer
    appId?: StringFilter | string
    version?: IntFilter | number
  }

  export type AppCreateWithoutNodesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    deployments?: DeploymentCreateNestedManyWithoutAppInput
    releases?: ReleaseCreateNestedManyWithoutAppInput
  }

  export type AppUncheckedCreateWithoutNodesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    deployments?: DeploymentUncheckedCreateNestedManyWithoutAppInput
    releases?: ReleaseUncheckedCreateNestedManyWithoutAppInput
  }

  export type AppCreateOrConnectWithoutNodesInput = {
    where: AppWhereUniqueInput
    create: XOR<AppCreateWithoutNodesInput, AppUncheckedCreateWithoutNodesInput>
  }

  export type DomNodeCreateWithoutChildrenInput = {
    id?: string
    name: string
    type: DomNodeType
    parentIndex?: string | null
    parentProp?: string | null
    app: AppCreateNestedOneWithoutNodesInput
    parent?: DomNodeCreateNestedOneWithoutChildrenInput
    attributes?: DomNodeAttributeCreateNestedManyWithoutNodeInput
  }

  export type DomNodeUncheckedCreateWithoutChildrenInput = {
    id?: string
    name: string
    type: DomNodeType
    parentId?: string | null
    parentIndex?: string | null
    parentProp?: string | null
    appId: string
    attributes?: DomNodeAttributeUncheckedCreateNestedManyWithoutNodeInput
  }

  export type DomNodeCreateOrConnectWithoutChildrenInput = {
    where: DomNodeWhereUniqueInput
    create: XOR<DomNodeCreateWithoutChildrenInput, DomNodeUncheckedCreateWithoutChildrenInput>
  }

  export type DomNodeCreateWithoutParentInput = {
    id?: string
    name: string
    type: DomNodeType
    parentIndex?: string | null
    parentProp?: string | null
    app: AppCreateNestedOneWithoutNodesInput
    children?: DomNodeCreateNestedManyWithoutParentInput
    attributes?: DomNodeAttributeCreateNestedManyWithoutNodeInput
  }

  export type DomNodeUncheckedCreateWithoutParentInput = {
    id?: string
    name: string
    type: DomNodeType
    parentIndex?: string | null
    parentProp?: string | null
    appId: string
    children?: DomNodeUncheckedCreateNestedManyWithoutParentInput
    attributes?: DomNodeAttributeUncheckedCreateNestedManyWithoutNodeInput
  }

  export type DomNodeCreateOrConnectWithoutParentInput = {
    where: DomNodeWhereUniqueInput
    create: XOR<DomNodeCreateWithoutParentInput, DomNodeUncheckedCreateWithoutParentInput>
  }

  export type DomNodeCreateManyParentInputEnvelope = {
    data: Enumerable<DomNodeCreateManyParentInput>
    skipDuplicates?: boolean
  }

  export type DomNodeAttributeCreateWithoutNodeInput = {
    namespace: string
    name: string
    type: DomNodeAttributeType
    value: string
  }

  export type DomNodeAttributeUncheckedCreateWithoutNodeInput = {
    namespace: string
    name: string
    type: DomNodeAttributeType
    value: string
  }

  export type DomNodeAttributeCreateOrConnectWithoutNodeInput = {
    where: DomNodeAttributeWhereUniqueInput
    create: XOR<DomNodeAttributeCreateWithoutNodeInput, DomNodeAttributeUncheckedCreateWithoutNodeInput>
  }

  export type DomNodeAttributeCreateManyNodeInputEnvelope = {
    data: Enumerable<DomNodeAttributeCreateManyNodeInput>
    skipDuplicates?: boolean
  }

  export type AppUpsertWithoutNodesInput = {
    update: XOR<AppUpdateWithoutNodesInput, AppUncheckedUpdateWithoutNodesInput>
    create: XOR<AppCreateWithoutNodesInput, AppUncheckedCreateWithoutNodesInput>
  }

  export type AppUpdateWithoutNodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    deployments?: DeploymentUpdateManyWithoutAppNestedInput
    releases?: ReleaseUpdateManyWithoutAppNestedInput
  }

  export type AppUncheckedUpdateWithoutNodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    deployments?: DeploymentUncheckedUpdateManyWithoutAppNestedInput
    releases?: ReleaseUncheckedUpdateManyWithoutAppNestedInput
  }

  export type DomNodeUpsertWithoutChildrenInput = {
    update: XOR<DomNodeUpdateWithoutChildrenInput, DomNodeUncheckedUpdateWithoutChildrenInput>
    create: XOR<DomNodeCreateWithoutChildrenInput, DomNodeUncheckedCreateWithoutChildrenInput>
  }

  export type DomNodeUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    app?: AppUpdateOneRequiredWithoutNodesNestedInput
    parent?: DomNodeUpdateOneWithoutChildrenNestedInput
    attributes?: DomNodeAttributeUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    appId?: StringFieldUpdateOperationsInput | string
    attributes?: DomNodeAttributeUncheckedUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeUpsertWithWhereUniqueWithoutParentInput = {
    where: DomNodeWhereUniqueInput
    update: XOR<DomNodeUpdateWithoutParentInput, DomNodeUncheckedUpdateWithoutParentInput>
    create: XOR<DomNodeCreateWithoutParentInput, DomNodeUncheckedCreateWithoutParentInput>
  }

  export type DomNodeUpdateWithWhereUniqueWithoutParentInput = {
    where: DomNodeWhereUniqueInput
    data: XOR<DomNodeUpdateWithoutParentInput, DomNodeUncheckedUpdateWithoutParentInput>
  }

  export type DomNodeUpdateManyWithWhereWithoutParentInput = {
    where: DomNodeScalarWhereInput
    data: XOR<DomNodeUpdateManyMutationInput, DomNodeUncheckedUpdateManyWithoutChildrenInput>
  }

  export type DomNodeAttributeUpsertWithWhereUniqueWithoutNodeInput = {
    where: DomNodeAttributeWhereUniqueInput
    update: XOR<DomNodeAttributeUpdateWithoutNodeInput, DomNodeAttributeUncheckedUpdateWithoutNodeInput>
    create: XOR<DomNodeAttributeCreateWithoutNodeInput, DomNodeAttributeUncheckedCreateWithoutNodeInput>
  }

  export type DomNodeAttributeUpdateWithWhereUniqueWithoutNodeInput = {
    where: DomNodeAttributeWhereUniqueInput
    data: XOR<DomNodeAttributeUpdateWithoutNodeInput, DomNodeAttributeUncheckedUpdateWithoutNodeInput>
  }

  export type DomNodeAttributeUpdateManyWithWhereWithoutNodeInput = {
    where: DomNodeAttributeScalarWhereInput
    data: XOR<DomNodeAttributeUpdateManyMutationInput, DomNodeAttributeUncheckedUpdateManyWithoutAttributesInput>
  }

  export type DomNodeAttributeScalarWhereInput = {
    AND?: Enumerable<DomNodeAttributeScalarWhereInput>
    OR?: Enumerable<DomNodeAttributeScalarWhereInput>
    NOT?: Enumerable<DomNodeAttributeScalarWhereInput>
    nodeId?: StringFilter | string
    namespace?: StringFilter | string
    name?: StringFilter | string
    type?: EnumDomNodeAttributeTypeFilter | DomNodeAttributeType
    value?: StringFilter | string
  }

  export type DomNodeCreateWithoutAttributesInput = {
    id?: string
    name: string
    type: DomNodeType
    parentIndex?: string | null
    parentProp?: string | null
    app: AppCreateNestedOneWithoutNodesInput
    parent?: DomNodeCreateNestedOneWithoutChildrenInput
    children?: DomNodeCreateNestedManyWithoutParentInput
  }

  export type DomNodeUncheckedCreateWithoutAttributesInput = {
    id?: string
    name: string
    type: DomNodeType
    parentId?: string | null
    parentIndex?: string | null
    parentProp?: string | null
    appId: string
    children?: DomNodeUncheckedCreateNestedManyWithoutParentInput
  }

  export type DomNodeCreateOrConnectWithoutAttributesInput = {
    where: DomNodeWhereUniqueInput
    create: XOR<DomNodeCreateWithoutAttributesInput, DomNodeUncheckedCreateWithoutAttributesInput>
  }

  export type DomNodeUpsertWithoutAttributesInput = {
    update: XOR<DomNodeUpdateWithoutAttributesInput, DomNodeUncheckedUpdateWithoutAttributesInput>
    create: XOR<DomNodeCreateWithoutAttributesInput, DomNodeUncheckedCreateWithoutAttributesInput>
  }

  export type DomNodeUpdateWithoutAttributesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    app?: AppUpdateOneRequiredWithoutNodesNestedInput
    parent?: DomNodeUpdateOneWithoutChildrenNestedInput
    children?: DomNodeUpdateManyWithoutParentNestedInput
  }

  export type DomNodeUncheckedUpdateWithoutAttributesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    appId?: StringFieldUpdateOperationsInput | string
    children?: DomNodeUncheckedUpdateManyWithoutParentNestedInput
  }

  export type AppCreateWithoutReleasesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    deployments?: DeploymentCreateNestedManyWithoutAppInput
    nodes?: DomNodeCreateNestedManyWithoutAppInput
  }

  export type AppUncheckedCreateWithoutReleasesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    deployments?: DeploymentUncheckedCreateNestedManyWithoutAppInput
    nodes?: DomNodeUncheckedCreateNestedManyWithoutAppInput
  }

  export type AppCreateOrConnectWithoutReleasesInput = {
    where: AppWhereUniqueInput
    create: XOR<AppCreateWithoutReleasesInput, AppUncheckedCreateWithoutReleasesInput>
  }

  export type DeploymentCreateWithoutReleaseInput = {
    id?: string
    createdAt?: Date | string
    app: AppCreateNestedOneWithoutDeploymentsInput
  }

  export type DeploymentUncheckedCreateWithoutReleaseInput = {
    id?: string
    createdAt?: Date | string
  }

  export type DeploymentCreateOrConnectWithoutReleaseInput = {
    where: DeploymentWhereUniqueInput
    create: XOR<DeploymentCreateWithoutReleaseInput, DeploymentUncheckedCreateWithoutReleaseInput>
  }

  export type DeploymentCreateManyReleaseInputEnvelope = {
    data: Enumerable<DeploymentCreateManyReleaseInput>
    skipDuplicates?: boolean
  }

  export type AppUpsertWithoutReleasesInput = {
    update: XOR<AppUpdateWithoutReleasesInput, AppUncheckedUpdateWithoutReleasesInput>
    create: XOR<AppCreateWithoutReleasesInput, AppUncheckedCreateWithoutReleasesInput>
  }

  export type AppUpdateWithoutReleasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    deployments?: DeploymentUpdateManyWithoutAppNestedInput
    nodes?: DomNodeUpdateManyWithoutAppNestedInput
  }

  export type AppUncheckedUpdateWithoutReleasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    deployments?: DeploymentUncheckedUpdateManyWithoutAppNestedInput
    nodes?: DomNodeUncheckedUpdateManyWithoutAppNestedInput
  }

  export type DeploymentUpsertWithWhereUniqueWithoutReleaseInput = {
    where: DeploymentWhereUniqueInput
    update: XOR<DeploymentUpdateWithoutReleaseInput, DeploymentUncheckedUpdateWithoutReleaseInput>
    create: XOR<DeploymentCreateWithoutReleaseInput, DeploymentUncheckedCreateWithoutReleaseInput>
  }

  export type DeploymentUpdateWithWhereUniqueWithoutReleaseInput = {
    where: DeploymentWhereUniqueInput
    data: XOR<DeploymentUpdateWithoutReleaseInput, DeploymentUncheckedUpdateWithoutReleaseInput>
  }

  export type DeploymentUpdateManyWithWhereWithoutReleaseInput = {
    where: DeploymentScalarWhereInput
    data: XOR<DeploymentUpdateManyMutationInput, DeploymentUncheckedUpdateManyWithoutDeploymentsInput>
  }

  export type AppCreateWithoutDeploymentsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    nodes?: DomNodeCreateNestedManyWithoutAppInput
    releases?: ReleaseCreateNestedManyWithoutAppInput
  }

  export type AppUncheckedCreateWithoutDeploymentsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    editedAt?: Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: boolean
    nodes?: DomNodeUncheckedCreateNestedManyWithoutAppInput
    releases?: ReleaseUncheckedCreateNestedManyWithoutAppInput
  }

  export type AppCreateOrConnectWithoutDeploymentsInput = {
    where: AppWhereUniqueInput
    create: XOR<AppCreateWithoutDeploymentsInput, AppUncheckedCreateWithoutDeploymentsInput>
  }

  export type ReleaseCreateWithoutDeploymentsInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    version: number
    app: AppCreateNestedOneWithoutReleasesInput
  }

  export type ReleaseUncheckedCreateWithoutDeploymentsInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    appId: string
    version: number
  }

  export type ReleaseCreateOrConnectWithoutDeploymentsInput = {
    where: ReleaseWhereUniqueInput
    create: XOR<ReleaseCreateWithoutDeploymentsInput, ReleaseUncheckedCreateWithoutDeploymentsInput>
  }

  export type AppUpsertWithoutDeploymentsInput = {
    update: XOR<AppUpdateWithoutDeploymentsInput, AppUncheckedUpdateWithoutDeploymentsInput>
    create: XOR<AppCreateWithoutDeploymentsInput, AppUncheckedCreateWithoutDeploymentsInput>
  }

  export type AppUpdateWithoutDeploymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    nodes?: DomNodeUpdateManyWithoutAppNestedInput
    releases?: ReleaseUpdateManyWithoutAppNestedInput
  }

  export type AppUncheckedUpdateWithoutDeploymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    editedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dom?: NullableJsonNullValueInput | InputJsonValue
    public?: BoolFieldUpdateOperationsInput | boolean
    nodes?: DomNodeUncheckedUpdateManyWithoutAppNestedInput
    releases?: ReleaseUncheckedUpdateManyWithoutAppNestedInput
  }

  export type ReleaseUpsertWithoutDeploymentsInput = {
    update: XOR<ReleaseUpdateWithoutDeploymentsInput, ReleaseUncheckedUpdateWithoutDeploymentsInput>
    create: XOR<ReleaseCreateWithoutDeploymentsInput, ReleaseUncheckedCreateWithoutDeploymentsInput>
  }

  export type ReleaseUpdateWithoutDeploymentsInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    version?: IntFieldUpdateOperationsInput | number
    app?: AppUpdateOneRequiredWithoutReleasesNestedInput
  }

  export type ReleaseUncheckedUpdateWithoutDeploymentsInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    appId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
  }

  export type DeploymentCreateManyAppInput = {
    id?: string
    createdAt?: Date | string
    version: number
  }

  export type DomNodeCreateManyAppInput = {
    id?: string
    name: string
    type: DomNodeType
    parentId?: string | null
    parentIndex?: string | null
    parentProp?: string | null
  }

  export type ReleaseCreateManyAppInput = {
    description: string
    createdAt?: Date | string
    snapshot: Buffer
    version: number
  }

  export type DeploymentUpdateWithoutAppInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    release?: ReleaseUpdateOneRequiredWithoutDeploymentsNestedInput
  }

  export type DeploymentUncheckedUpdateWithoutAppInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    version?: IntFieldUpdateOperationsInput | number
  }

  export type DeploymentUncheckedUpdateManyWithoutDeploymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    version?: IntFieldUpdateOperationsInput | number
  }

  export type DomNodeUpdateWithoutAppInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: DomNodeUpdateOneWithoutChildrenNestedInput
    children?: DomNodeUpdateManyWithoutParentNestedInput
    attributes?: DomNodeAttributeUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeUncheckedUpdateWithoutAppInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    children?: DomNodeUncheckedUpdateManyWithoutParentNestedInput
    attributes?: DomNodeAttributeUncheckedUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeUncheckedUpdateManyWithoutNodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReleaseUpdateWithoutAppInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    version?: IntFieldUpdateOperationsInput | number
    deployments?: DeploymentUpdateManyWithoutReleaseNestedInput
  }

  export type ReleaseUncheckedUpdateWithoutAppInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    version?: IntFieldUpdateOperationsInput | number
    deployments?: DeploymentUncheckedUpdateManyWithoutReleaseNestedInput
  }

  export type ReleaseUncheckedUpdateManyWithoutReleasesInput = {
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshot?: BytesFieldUpdateOperationsInput | Buffer
    version?: IntFieldUpdateOperationsInput | number
  }

  export type DomNodeCreateManyParentInput = {
    id?: string
    name: string
    type: DomNodeType
    parentIndex?: string | null
    parentProp?: string | null
    appId: string
  }

  export type DomNodeAttributeCreateManyNodeInput = {
    namespace: string
    name: string
    type: DomNodeAttributeType
    value: string
  }

  export type DomNodeUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    app?: AppUpdateOneRequiredWithoutNodesNestedInput
    children?: DomNodeUpdateManyWithoutParentNestedInput
    attributes?: DomNodeAttributeUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    appId?: StringFieldUpdateOperationsInput | string
    children?: DomNodeUncheckedUpdateManyWithoutParentNestedInput
    attributes?: DomNodeAttributeUncheckedUpdateManyWithoutNodeNestedInput
  }

  export type DomNodeUncheckedUpdateManyWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeTypeFieldUpdateOperationsInput | DomNodeType
    parentIndex?: NullableStringFieldUpdateOperationsInput | string | null
    parentProp?: NullableStringFieldUpdateOperationsInput | string | null
    appId?: StringFieldUpdateOperationsInput | string
  }

  export type DomNodeAttributeUpdateWithoutNodeInput = {
    namespace?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeAttributeTypeFieldUpdateOperationsInput | DomNodeAttributeType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type DomNodeAttributeUncheckedUpdateWithoutNodeInput = {
    namespace?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeAttributeTypeFieldUpdateOperationsInput | DomNodeAttributeType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type DomNodeAttributeUncheckedUpdateManyWithoutAttributesInput = {
    namespace?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumDomNodeAttributeTypeFieldUpdateOperationsInput | DomNodeAttributeType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type DeploymentCreateManyReleaseInput = {
    id?: string
    createdAt?: Date | string
  }

  export type DeploymentUpdateWithoutReleaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    app?: AppUpdateOneRequiredWithoutDeploymentsNestedInput
  }

  export type DeploymentUncheckedUpdateWithoutReleaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}