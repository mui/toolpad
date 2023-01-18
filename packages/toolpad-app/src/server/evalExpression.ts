import { createServerJsRuntime } from '@mui/toolpad-core/jsRuntime';

export default async function evalExpression(
  expression: string,
  globalScope: Record<string, unknown> = {},
) {
  const jsServerRuntime = await createServerJsRuntime();
  const { value, error } = jsServerRuntime.evaluateExpression(expression, globalScope);

  if (error) {
    throw error;
  }

  return value;
}
