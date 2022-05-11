import { BindableAttrValue, LiveBinding } from '@mui/toolpad-core';
import React from 'react';
import { evaluateBindable, useJsRuntime } from '@mui/toolpad-core/runtime';
import { Serializable } from '../../server/evalExpression';
import evaluateBindableServer from '../../server/evaluateBindable';

export interface UseEvaluateLiveBinding {
  server?: boolean;
  input: BindableAttrValue<any> | null;
  globalScope: Record<string, unknown>;
}

export function useEvaluateLiveBinding({ server, input, globalScope }: UseEvaluateLiveBinding) {
  const jsRuntime = useJsRuntime();

  const previewValue: LiveBinding = React.useMemo(() => {
    if (server) {
      const ctx = jsRuntime.newContext();
      try {
        return evaluateBindableServer(ctx, input, globalScope as Record<string, Serializable>);
      } finally {
        ctx.dispose();
      }
    } else {
      return evaluateBindable(input, globalScope);
    }
  }, [server, jsRuntime, input, globalScope]);

  return previewValue;
}
