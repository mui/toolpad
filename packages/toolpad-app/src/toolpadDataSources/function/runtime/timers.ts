import * as ivm from 'isolated-vm';
import { ToolpadFunctionRuntimeBridge } from './types';

const TOOLPAD_BRIDGE: ToolpadFunctionRuntimeBridge = global.TOOLPAD_BRIDGE;

// @ts-expect-error Can't turn of @types/node which gets pulled in automatically
// https://github.com/microsoft/TypeScript/issues/37053
global.setTimeout = (cb: () => void, ms: number): number => {
  return TOOLPAD_BRIDGE.setTimeout.applySync(null, [new ivm.Reference(cb), new ivm.Reference(ms)], {
    result: { copy: true },
  });
};

global.clearTimeout = (timeout): void => {
  return TOOLPAD_BRIDGE.clearTimeout.applyIgnored(null, [timeout], {
    arguments: { copy: true },
  });
};

export {};
