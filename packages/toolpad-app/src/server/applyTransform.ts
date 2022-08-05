import evalExpression from './evalExpression';

export default async function applyTransform(transform: string, data: any): Promise<any> {
  const transformFn = `(data) => {${transform}}`;
  return {
    data: await evalExpression(`${transformFn}(${JSON.stringify(data)})`),
  };
}
