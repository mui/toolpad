import * as vm from 'vm';
import * as React from 'react';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { BindingEvaluationResult, JsRuntime } from './types.js';

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

export async function createServerJsRuntime(): Promise<JsRuntime> {
  return {
    evaluateExpression: (code, globalScope) => evalExpressionInContext(code, globalScope),
  };
}

export function useServerJsRuntime(): JsRuntime {
  return React.useMemo(
    () => ({
      evaluateExpression: (code, globalScope) => evalExpressionInContext(code, globalScope),
    }),
    [],
  );
}
