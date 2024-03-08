import { Emitter } from '@toolpad/utils/events';
import type { RuntimeEvents } from '@toolpad/studio-runtime';
import { TOOLPAD_BRIDGE_GLOBAL } from '../constants';
import type { AppCanvasState, PageViewState } from '../types';

declare global {
  interface Window {
    [TOOLPAD_BRIDGE_GLOBAL]?: ToolpadBridge | ((bridge: ToolpadBridge) => void);
  }
}

const COMMAND_HANDLERS = Symbol('hidden property to hold the command handlers');

type Commands<T extends Record<string, Function>> = T & {
  [COMMAND_HANDLERS]: Partial<T>;
};

export function createCommands<T extends Record<string, Function>>(
  initial: Partial<T> = {},
): Commands<T> {
  return new Proxy(
    {
      [COMMAND_HANDLERS]: initial,
    },
    {
      get(target, prop, receiver) {
        if (typeof prop !== 'string') {
          return Reflect.get(target, prop, receiver);
        }

        return (...args: any[]): any => {
          const handler = target[COMMAND_HANDLERS][prop];
          if (typeof handler !== 'function') {
            throw new Error(`Command "${prop}" not recognized.`);
          }
          return handler(...args);
        };
      },
    },
  ) as Commands<T>;
}

export function setCommandHandler<T extends Record<string, Function>, K extends keyof T & string>(
  commands: Commands<T>,
  name: K,
  handler: T[K],
) {
  commands[COMMAND_HANDLERS][name] = handler;
}

// Interface to communicate between editor and canvas
export interface ToolpadBridge {
  // Events fired in the editor, listened in the canvas
  editorEvents: Emitter<{}>;
  // Commands executed from the canvas, ran in the editor
  editorCommands: Commands<{}>;
  // Events fired in the canvas, listened in the editor
  canvasEvents: Emitter<RuntimeEvents>;
  // Commands executed from the editor, ran in the canvas
  canvasCommands: Commands<{
    update(updates: AppCanvasState): void;
    getViewCoordinates(clientX: number, clientY: number): { x: number; y: number } | null;
    getPageViewState(): PageViewState;
    isReady(): boolean;
    invalidateQueries(): void;
  }>;
}
const isRenderedInCanvas =
  typeof window !== 'undefined' &&
  (window.frameElement as HTMLIFrameElement | null)?.dataset.toolpadCanvas;

let canvasIsReady = false;

const bridge: ToolpadBridge | null = isRenderedInCanvas
  ? ({
      editorEvents: new Emitter(),
      editorCommands: createCommands(),
      canvasEvents: new Emitter(),
      canvasCommands: createCommands({
        isReady: () => canvasIsReady,
        getPageViewState: () => {
          throw new Error('Not implemented');
        },
        getViewCoordinates: () => {
          throw new Error('Not implemented');
        },
        invalidateQueries: () => {
          throw new Error('Not implemented');
        },
        update: () => {
          throw new Error('Not implemented');
        },
      }),
    } satisfies ToolpadBridge)
  : null;

bridge?.canvasEvents.on('ready', () => {
  canvasIsReady = true;
});

if (bridge) {
  if (typeof window[TOOLPAD_BRIDGE_GLOBAL] === 'function') {
    window[TOOLPAD_BRIDGE_GLOBAL](bridge);
  }

  window[TOOLPAD_BRIDGE_GLOBAL] = bridge;
}

export { bridge };
