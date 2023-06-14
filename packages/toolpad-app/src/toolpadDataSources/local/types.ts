import { BindableAttrValue, ExecFetchResult, PrimitiveValueType } from '@mui/toolpad-core';
import type { IntrospectionResult } from '../../server/functionsTypesWorker';

export interface LocalConnectionParams {}

export interface LocalQuery {
  /**
   * File containing the handler, default "functions.ts"
   */
  file?: string;
  /**
   * name of the handler to execute.
   */
  function?: string;
  /**
   * if defined, execute the function as
   *   fn(...spreadParameters.map((name) => parameters[name]))
   * else execute the function as
   *   fn({ parameters })
   */
  spreadParameters?: string[];
}

export type LocalParams = {
  readonly searchParams: [string, BindableAttrValue<any>][];
  readonly body?: Body;
};

export type LocalPrivateQuery =
  | {
      kind: 'debugExec';
      query: LocalQuery;
      params: Record<string, any>;
    }
  | {
      kind: 'introspection';
    }
  | {
      kind: 'openEditor';
    };

export interface FetchResult extends ExecFetchResult<any> {
  data: any;
}

export interface IntrospectedFunction {
  name: string;
  file: string;
  parameters: Record<string, PrimitiveValueType>;
}

export type { IntrospectionResult };
