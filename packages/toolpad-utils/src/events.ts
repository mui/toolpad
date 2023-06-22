export type EventName = string | symbol;

export type EventHandlers = Record<EventName, unknown>;

export type EventHandler<T extends EventHandlers, K extends keyof T = keyof T> = (
  event: T[K],
) => void;

export type AllEventsHandler<T extends EventHandlers, K extends keyof T = keyof T> = (
  type: K,
  event: T[K],
) => void;

/**
 * Lightweight event emitter
 */
export class Emitter<T extends EventHandlers = {}> {
  private handlers = new Map<keyof T, Set<EventHandler<T> | AllEventsHandler<T>>>();

  /**
   * Add a listener for an event
   */
  on(name: '*', handler: AllEventsHandler<T>): void;
  on<K extends keyof T>(name: K, handler: EventHandler<T, K>): void;
  on<K extends keyof T>(name: K | '*', handler: EventHandler<T, K> | AllEventsHandler<T>): void {
    let eventHandlers = this.handlers.get(name);
    if (!eventHandlers) {
      eventHandlers = new Set();
      this.handlers.set(name, eventHandlers);
    }
    eventHandlers.add(handler as EventHandler<T> | AllEventsHandler<T>);
  }

  /**
   * Remove a listener from an event
   */
  off<K extends keyof T>(name: K, handler: EventHandler<T, K>) {
    const eventHandlers = this.handlers.get(name);
    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler<T> | AllEventsHandler<T>);
      if (eventHandlers.size <= 0) {
        this.handlers.delete(name);
      }
    }
  }

  /**
   * Subscribe to an event and return an unsubscribe function.
   */
  subscribe<K extends keyof T>(name: K, handler: EventHandler<T, K>) {
    this.on(name, handler);
    return () => {
      this.off(name, handler);
    };
  }

  /**
   * Emit an event.
   */
  emit<K extends keyof T>(name: K, event: T[K]) {
    const eventHandlers = this.handlers.get(name);
    if (eventHandlers) {
      for (const eventHandler of eventHandlers) {
        (eventHandler as EventHandler<T, K>)(event);
      }
    }
    const allHandlers = this.handlers.get('*');
    if (allHandlers) {
      for (const eventHandler of allHandlers) {
        (eventHandler as AllEventsHandler<T>)(name, event);
      }
    }
  }
}
