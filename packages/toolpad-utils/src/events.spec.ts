import { vitest, test, expect } from 'vitest';
import { Emitter } from './events';

test('can add/remove event handlers', async () => {
  const handler = vitest.fn();
  const emitter = new Emitter<{ hello: number }>();
  emitter.on('hello', handler);
  emitter.emit('hello', 1);
  expect(handler).toBeCalledWith(1);
  emitter.off('hello', handler);
  emitter.emit('hello', 2);
  expect(handler).not.toBeCalledWith(2);
});

test('can subscribe event handlers', async () => {
  const handler = vitest.fn();
  const emitter = new Emitter<{ hello: number }>();
  const unsubscribe = emitter.subscribe('hello', handler);
  emitter.emit('hello', 1);
  expect(handler).toBeCalledWith(1);
  unsubscribe();
  emitter.emit('hello', 2);
  expect(handler).not.toBeCalledWith(2);
});

test('can add/remove event handlers for symbols', async () => {
  const SYMBOL = Symbol('event');
  const handler = vitest.fn();
  const emitter = new Emitter<{ [SYMBOL]: number }>();
  emitter.on(SYMBOL, handler);
  emitter.emit(SYMBOL, 1);
  expect(handler).toBeCalledWith(1);
  emitter.off(SYMBOL, handler);
  emitter.emit(SYMBOL, 2);
  expect(handler).not.toBeCalledWith(2);
});

test('only fires selected event', async () => {
  const handler1 = vitest.fn();
  const handler2 = vitest.fn();
  const emitter = new Emitter<{ hello: number; world: number }>();
  emitter.on('hello', handler1);
  emitter.on('world', handler2);
  emitter.emit('hello', 1);
  expect(handler1).toBeCalledWith(1);
  expect(handler2).not.toBeCalledWith(1);
});
