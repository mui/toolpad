const TOOLPAD_BRIDGE = global.TOOLPAD_BRIDGE;

global.setTimeout = (cb: () => void, ms: number): number => {
  return TOOLPAD_BRIDGE.setTimeout.applySync(null, [cb, ms], {
    arguments: { reference: true },
    result: { copy: true },
  });
};

global.clearTimeout = (timeout): number => {
  return TOOLPAD_BRIDGE.clearTimeout.applyIgnored(null, [timeout], {
    arguments: { copy: true },
  });
};

export {};
