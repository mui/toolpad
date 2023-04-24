export type EventName = string | symbol;

export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Lightweight event emitter
 */
export class Emitter<T extends Record<EventName, unknown> = {}> {
  private handlers = new Map<keyof T, Set<EventHandler<any>>>();

  /**
   * Add a listener for an event
   */
  on<K extends keyof T>(name: K, handler: EventHandler<T[K]>) {
    let eventHandlers = this.handlers.get(name);
    if (!eventHandlers) {
      eventHandlers = new Set();
      this.handlers.set(name, eventHandlers);
    }
    eventHandlers.add(handler);
  }

  /**
   * Remove a listener from an event
   */
  off<K extends keyof T>(name: K, handler: EventHandler<T[K]>) {
    const eventHandlers = this.handlers.get(name);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size <= 0) {
        this.handlers.delete(name);
      }
    }
  }

  /**
   * Subscribe to an event and return an unsubscribe function.
   */
  subscribe<K extends keyof T>(name: K, handler: EventHandler<T[K]>) {
    this.on(name, handler);
    return () => {
      this.off(name, handler);
    };
  }

  /**
   * Emit an event.
   */
  emit<K extends keyof T>(name: K, event: T[K] extends undefined ? void | undefined : T[K]) {
    const eventHandlers = this.handlers.get(name);
    if (eventHandlers) {
      for (const eventHandler of eventHandlers) {
        eventHandler(event);
      }
    }
  }
}
