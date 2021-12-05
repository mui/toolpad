// Implementation based on https://github.com/withastro/esm-hmr

import { Channel, Handler } from './channel';

export type DisposeCallback = () => void;
export type AcceptCallback = (args: { module: any; deps: any[] }) => void;
export type AcceptCallbackObject = {
  deps: string[];
  callback: AcceptCallback;
};

function debug(...args: any[]) {
  // console.log('[ESM-HMR]', ...args);
}

function reload() {
  window.location.reload();
}

class HotModuleContext {
  private channel: Channel;

  id: string;

  data: any = {};

  isLocked: boolean = false;

  isDeclined: boolean = false;

  isAccepted: boolean = false;

  acceptCallbacks: AcceptCallbackObject[] = [];

  disposeCallbacks: DisposeCallback[] = [];

  constructor(id: string, channel: Channel) {
    this.id = id;
    this.channel = channel;
  }

  lock(): void {
    this.isLocked = true;
  }

  dispose(callback: DisposeCallback): void {
    this.disposeCallbacks.push(callback);
  }

  // eslint-disable-next-line class-methods-use-this
  invalidate(): void {
    reload();
  }

  decline(): void {
    this.isDeclined = true;
  }

  accept(_deps: string[], callback: true | AcceptCallback = true): void {
    if (this.isLocked) {
      return;
    }
    if (!this.isAccepted) {
      this.channel.sendMessage({ id: this.id, type: 'hotAccept' });
      this.isAccepted = true;
    }
    if (!Array.isArray(_deps)) {
      callback = _deps || callback;
      _deps = [];
    }
    if (callback === true) {
      callback = () => {};
    }
    const deps = _deps.map((dep) => {
      return new URL(dep, `${window.location.origin}${this.id}`).pathname;
    });
    this.acceptCallbacks.push({
      deps,
      callback,
    });
  }
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

async function getDependants(id: string): Promise<{ dependants: string[] }> {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = (event) => resolve(event.data);
    navigator.serviceWorker.controller?.postMessage({ type: 'getDependants', id }, [port2]);
  });
}

export class HotModulesProvider {
  private channel: Channel;

  private registeredModules = new Map<string, HotModuleContext>();

  private msgHandler: Handler | null = null;

  constructor(channel: Channel) {
    this.channel = channel;
  }

  start() {
    if (this.msgHandler) {
      return false;
    }
    this.msgHandler = (msg: unknown) => {
      if (typeof msg !== 'object' || !msg || !hasOwnProperty(msg, 'type')) {
        return;
      }
      debug('message', msg);
      if (msg.type === 'reload') {
        debug('message: reload');
        reload();
        return;
      }
      if (msg.type !== 'update' || !hasOwnProperty(msg, 'url') || typeof msg.url !== 'string') {
        debug('message: unknown', msg);
        return;
      }
      debug('message: update', msg);
      debug(msg.url, this.registeredModules.keys());
      this.applyUpdate(msg.url)
        .then((ok) => {
          if (!ok) {
            reload();
          }
        })
        .catch((err) => {
          console.error(err);
          reload();
        });
    };
    this.channel.addListener(this.msgHandler);
    debug('listening for file changes...');
    return true;
  }

  stop() {
    if (!this.msgHandler) {
      return false;
    }
    this.channel.removeListener(this.msgHandler);
    this.msgHandler = null;
    return true;
  }

  private async applyUpdate(id: string): Promise<boolean> {
    const ctx = this.registeredModules.get(id);

    if (!ctx) {
      return false;
    }

    if (ctx.isDeclined) {
      return false;
    }

    const acceptCallbacks = ctx.acceptCallbacks;
    const disposeCallbacks = ctx.disposeCallbacks;
    ctx.disposeCallbacks = [];
    ctx.data = {};

    disposeCallbacks.map((callback) => callback());
    const updateID = Date.now();

    if (acceptCallbacks.length <= 0) {
      const { dependants } = await getDependants(id);
      if (dependants.length <= 0) {
        return false;
      }
      const applyResults = await Promise.all(
        dependants.map((dependant) => this.applyUpdate(dependant)),
      );
      return applyResults.every(Boolean);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const { deps, callback: acceptCallback } of acceptCallbacks) {
      // eslint-disable-next-line no-await-in-loop
      const [module, ...depModules] = await Promise.all([
        import(`${id}?mtime=${updateID}`),
        ...deps.map((d) => import(`${d}?mtime=${updateID}`)),
      ]);
      acceptCallback({ module, deps: depModules });
    }

    return true;
  }

  createHotContext(fullUrl: string) {
    const id = new URL(fullUrl).pathname;
    const existing = this.registeredModules.get(id);
    if (existing) {
      existing.lock();
      return existing;
    }
    const ctx = new HotModuleContext(id, this.channel);
    this.registeredModules.set(id, ctx);
    return ctx;
  }
}
