import { BindableAttrValue, BindableAttrValues, LiveBinding } from '@mui/toolpad-core';
import React from 'react';
import {
  evaluateBindable as evaluateBindableBrowser,
  useJsRuntime,
} from '@mui/toolpad-core/runtime';
import { QuickJSRuntime } from 'quickjs-emscripten';
import { Serializable } from '../../server/evalExpression';
import evaluateBindableServer from '../../server/evaluateBindable';
import { mapValues } from '../../utils/collections';

interface EvaluateBindableAttrValueConfig {
  jsRuntime?: QuickJSRuntime;
}

function evaluateBindableAttrValue(
  input: BindableAttrValue<any> | null,
  globalScope: Record<string, unknown>,
  { jsRuntime }: EvaluateBindableAttrValueConfig = {},
) {
  if (jsRuntime) {
    const ctx = jsRuntime.newContext();
    try {
      return evaluateBindableServer(ctx, input, globalScope as Record<string, Serializable>);
    } finally {
      ctx.dispose();
    }
  } else {
    return evaluateBindableBrowser(input, globalScope);
  }
}

function evaluateBindableAttrValues(
  input: BindableAttrValues<any>,
  globalScope: Record<string, unknown>,
  config: EvaluateBindableAttrValueConfig = {},
): Record<string, LiveBinding> {
  return mapValues(input, (bindable) =>
    evaluateBindableAttrValue(bindable || null, globalScope, config),
  );
}

export interface UseEvaluateLiveBinding {
  /**
   * Whether to use the serverside method (quickjs) or the client side
   * NOTE: This doesn't necessarily correspond to `typeof window === 'undefined'`.
   *       One may want to evaluate serverside bindings on the browser. for e.g. previewing
   */
  server?: boolean;
  input: BindableAttrValue<any> | null;
  globalScope: Record<string, unknown>;
}

export function useEvaluateLiveBinding({
  server,
  input,
  globalScope,
}: UseEvaluateLiveBinding): LiveBinding {
  const jsRuntime = useJsRuntime();
  return React.useMemo(() => {
    return evaluateBindableAttrValue(input, globalScope, {
      jsRuntime: server ? jsRuntime : undefined,
    });
  }, [server, jsRuntime, input, globalScope]);
}

export interface UseEvaluateLiveBindings {
  /**
   * Whether to use the serverside method (quickjs) or the client side
   * NOTE: This doesn't necessarily correspond to `typeof window === 'undefined'`.
   *       One may want to evaluate serverside bindings on the browser. for e.g. previewing
   */
  server?: boolean;
  input: BindableAttrValues<any>;
  globalScope: Record<string, unknown>;
}

export function useEvaluateLiveBindings({
  server,
  input,
  globalScope,
}: UseEvaluateLiveBindings): Record<string, LiveBinding> {
  const jsRuntime = useJsRuntime();
  return React.useMemo(() => {
    return evaluateBindableAttrValues(input, globalScope, {
      jsRuntime: server ? jsRuntime : undefined,
    });
  }, [server, jsRuntime, input, globalScope]);
}
