import * as React from 'react';
import { StudioPage } from '../types';

type Handler = () => void;

export interface PageStateObservable {
  getValue: (key: string) => any;
  setValue: (key: string, newValue: any) => void;
  subscribe: (key: string, handler: Handler) => () => void;
}

function throwNoContext(): any {
  throw new Error('No Page context found');
}

const PageStateContext = React.createContext<PageStateObservable>({
  getValue: throwNoContext,
  setValue: throwNoContext,
  subscribe: throwNoContext,
});

function fireHandlers(handlers: Map<string, Set<Handler>>, key: string) {
  const handlersToRun = handlers.get(key);
  if (handlersToRun) {
    for (const handler of handlersToRun) {
      handler();
    }
  }
}

interface PageStateProps {
  children?: React.ReactNode;
  page: StudioPage;
}

export default function PageStateProvider({ children, page }: PageStateProps) {
  const handlers = React.useRef(new Map<string, Set<Handler>>());

  const state = React.useRef(
    Object.fromEntries(
      Object.entries(page.state).map(([key, stateDef]) => {
        return [key, stateDef.initialValue];
      }),
    ),
  );

  React.useEffect(() => {
    for (const [key, stateDef] of Object.entries(page.state)) {
      if (!Object.prototype.hasOwnProperty.call(state.current, key)) {
        state.current[key] = stateDef.initialValue;
        fireHandlers(handlers.current, key);
      }
    }
  }, [page.state]);

  const ctx = React.useMemo(() => {
    const subscribe = (key: string, handler: Handler) => {
      let keyHandlers = handlers.current.get(key);
      if (!keyHandlers) {
        keyHandlers = new Set();
        handlers.current.set(key, keyHandlers);
      }
      keyHandlers.add(handler);
      return () => {
        const keyHandlers = handlers.current.get(key);
        if (keyHandlers) {
          keyHandlers?.delete(handler);
        }
      };
    };

    const getValue = (key: string) => {
      return state.current[key];
    };

    const setValue = (key: string, newValue: any) => {
      const actualValue = state.current[key];
      state.current[key] = newValue;
      if (actualValue !== newValue) {
        fireHandlers(handlers.current, key);
      }
    };

    return {
      getValue,
      setValue,
      subscribe,
    };
  }, []);
  return <PageStateContext.Provider value={ctx}>{children}</PageStateContext.Provider>;
}

export function usePageStateObservable() {
  return React.useContext(PageStateContext);
}
