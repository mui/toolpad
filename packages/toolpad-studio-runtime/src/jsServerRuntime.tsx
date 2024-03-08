import * as vm from 'vm';
import * as React from 'react';
import { errorFrom } from '@toolpad/utils/errors';
import { BindingEvaluationResult, JsRuntime } from './types';

function evalExpressionInContext(
  expression: string,
  globalScope: Record<string, unknown> = {},
): BindingEvaluationResult {
  try {
    const value = vm.runInNewContext(expression, globalScope);
    return { value };
  } catch (rawError) {
    return { error: errorFrom(rawError) };
  }
}

export function createServerJsRuntime(env?: Record<string, string | undefined>): JsRuntime {
  return {
    getEnv() {
      if (env) {
        return env;
      }
      throw new Error(`Env variables are not supported in this context`);
    },
    evaluateExpression: (code, globalScope) => evalExpressionInContext(code, globalScope),
  };
}

export function useServerJsRuntime(): JsRuntime {
  return React.useMemo(() => {
    // process.env is not available in the browser
    const processEnv = {};
    return createServerJsRuntime(processEnv);
  }, []);
}
