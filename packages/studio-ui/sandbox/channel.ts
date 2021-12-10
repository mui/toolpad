export type Handler<IncomingMessage = unknown> = (msg: IncomingMessage) => void;

export class Channel<IncomingMessage = unknown, OutGoingMessage = unknown> {
  private targetWindow;

  private handlers: Map<
    Handler<IncomingMessage>,
    (this: Window, ev: MessageEvent<IncomingMessage>) => any
  > = new Map();

  constructor(target: Window) {
    this.targetWindow = target;
  }

  sendMessage(msg: OutGoingMessage) {
    this.targetWindow.postMessage(msg, window.location.origin);
  }

  addListener(msgHandler: Handler<IncomingMessage>) {
    const handler = (event: MessageEvent<IncomingMessage>) => {
      // TODO: How can we validate?
      if (event.source === this.targetWindow) {
        msgHandler(event.data);
      }
    };
    this.handlers.set(msgHandler, handler);
    window.addEventListener('message', handler, false);
  }

  removeListener(msgHandler: Handler<IncomingMessage>) {
    const handler = this.handlers.get(msgHandler);
    this.handlers.delete(msgHandler);
    if (handler) {
      window.removeEventListener('message', handler);
    }
  }
}
