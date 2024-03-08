import { JsRuntime } from '@toolpad/studio-runtime';

export default async function applyTransform(
  jsRuntime: JsRuntime,
  transform: string,
  data: any,
): Promise<any> {
  const transformFn = `(data) => {${transform}}`;
  const { error, value } = jsRuntime.evaluateExpression(
    `(${transformFn})(${JSON.stringify(data)})`,
    {},
  );
  if (error) {
    throw error;
  }
  return value;
}
