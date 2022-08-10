import evalExpression from './evalExpression';

export default async function applyTransform(transform: string, data: any): Promise<any> {
  const transformFn = `(data) => {${transform}}`;
  return evalExpression(`${transformFn}(${JSON.stringify(data)})`);
}
