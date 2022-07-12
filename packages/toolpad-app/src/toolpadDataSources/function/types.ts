export interface FunctionConnectionParams {}

export interface FunctionQuery {
  readonly module: string;
}

export interface PrivateQuery<I, R> {
  input: I;
  result: R;
}

export interface FunctionResult {}

export interface PrivateQueries {
  debug: PrivateQuery<FunctionQuery, {}>;
}
