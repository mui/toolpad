export type EventName = string | symbol;

export type EventHandler<T = unknown> = (event: T) => void;

export default class Emitter<T extends Record<EventName, unknown> = {}> {
  private handlers = new Map<keyof T, Set<EventHandler<any>>>();

  on<K extends keyof T>(name: K, handler: EventHandler<T[K]>) {
    let eventHandlers = this.handlers.get(name);
    if (!eventHandlers) {
      eventHandlers = new Set();
      this.handlers.set(name, eventHandlers);
    }
    eventHandlers.add(handler);
  }

  off<K extends keyof T>(name: K, handler: EventHandler<T[K]>) {
    const eventHandlers = this.handlers.get(name);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size <= 0) {
        this.handlers.delete(name);
      }
    }
  }

  emit<K extends keyof T>(name: K, event: T[K] extends undefined ? void | undefined : T[K]) {
    const eventHandlers = this.handlers.get(name);
    if (eventHandlers) {
      for (const eventHandler of eventHandlers) {
        eventHandler(event);
      }
    }
  }
}
