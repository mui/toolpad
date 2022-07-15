const TOOLPAD_BRIDGE = global.TOOLPAD_BRIDGE;

function consoleMethod(level: string) {
  return (...args: any[]) => {
    TOOLPAD_BRIDGE.console.apply(null, [level, JSON.stringify(args)], {
      arguments: { copy: true },
    });
  };
}

global.console = {
  log: consoleMethod('log'),
  debug: consoleMethod('debug'),
  info: consoleMethod('info'),
  warn: consoleMethod('warn'),
  error: consoleMethod('error'),
};

export {};
