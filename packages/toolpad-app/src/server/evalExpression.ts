import { getQuickJS, QuickJSHandle, QuickJSVm } from 'quickjs-emscripten';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function newJson(vm: QuickJSVm, json: Json): QuickJSHandle {
  switch (typeof json) {
    case 'string':
      return vm.newString(json);
    case 'number':
      return vm.newNumber(json);
    case 'boolean':
      return json ? vm.true : vm.false;
    case 'object': {
      if (!json) {
        return vm.null;
      }
      if (Array.isArray(json)) {
        const result = vm.newArray();
        Object.values(json).forEach((value, i) => {
          const valueHandle = newJson(vm, value);
          vm.setProp(result, i, valueHandle);
          valueHandle.dispose();
        });
        return result;
      }
      const result = vm.newObject();
      Object.entries(json).forEach(([key, value]) => {
        const valueHandle = newJson(vm, value);
        vm.setProp(result, key, valueHandle);
        valueHandle.dispose();
      });
      return result;
    }
    default:
      throw new Error(`Invariant: invalid value: ${json}`);
  }
}

export default async function evalExpression(
  expression: string,
  globalScope: Record<string, Json>,
) {
  const QuickJS = await getQuickJS();
  const vm = QuickJS.createVm();

  try {
    Object.entries(globalScope).forEach(([key, value]) => {
      const valueHandle = newJson(vm, value);
      vm.setProp(vm.global, key, valueHandle);
      valueHandle.dispose();
    });

    const result = vm.unwrapResult(vm.evalCode(expression));
    const resultValue = vm.dump(result);
    result.dispose();
    return resultValue;
  } finally {
    vm.dispose();
  }
}
