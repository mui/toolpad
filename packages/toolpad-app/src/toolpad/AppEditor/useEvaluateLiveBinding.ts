import {
  BindableAttrEntries,
  BindableAttrValue,
  BindableAttrValues,
  JsRuntime,
  LiveBinding,
} from '@mui/toolpad-core';
import * as React from 'react';
import { evaluateBindable } from '@mui/toolpad-core/jsRuntime';
import { mapValues } from '@mui/toolpad-utils/collections';

function evaluateBindableAttrEntries(
  jsRuntime: JsRuntime,
  input: BindableAttrEntries,
  globalScope: Record<string, unknown>,
  env?: Record<string, string>,
): [string, LiveBinding][] {
  return input.map(([key, bindable]) => [
    key,
    evaluateBindable(jsRuntime, bindable || null, globalScope, env),
  ]);
}

function evaluateBindableAttrValues(
  jsRuntime: JsRuntime,
  input: BindableAttrValues<any>,
  globalScope: Record<string, unknown>,
  env?: Record<string, string>,
): Record<string, LiveBinding> {
  return mapValues(input, (bindable) =>
    evaluateBindable(jsRuntime, bindable || null, globalScope, env),
  );
}

export interface UseEvaluateLiveBinding {
  jsRuntime: JsRuntime;
  input: BindableAttrValue<any> | null;
  globalScope: Record<string, unknown>;
  env?: Record<string, string>;
}

export function useEvaluateLiveBinding({
  jsRuntime,
  input,
  globalScope,
  env = {},
}: UseEvaluateLiveBinding): LiveBinding {
  return React.useMemo(() => {
    return evaluateBindable(jsRuntime, input, globalScope, env);
  }, [jsRuntime, input, globalScope, env]);
}

export interface UseEvaluateLiveBindings {
  jsRuntime: JsRuntime;
  server?: boolean;
  input: BindableAttrValues<any>;
  globalScope: Record<string, unknown>;
  env?: Record<string, string>;
}

export function useEvaluateLiveBindings({
  jsRuntime,
  input,
  globalScope,
  env = {},
}: UseEvaluateLiveBindings): Partial<Record<string, LiveBinding>> {
  return React.useMemo(() => {
    return evaluateBindableAttrValues(jsRuntime, input, globalScope, env);
  }, [jsRuntime, input, globalScope, env]);
}

export interface UseEvaluateLiveBindingEntries {
  jsRuntime: JsRuntime;
  input: BindableAttrEntries;
  globalScope: Record<string, unknown>;
  env?: Record<string, string>;
}

export function useEvaluateLiveBindingEntries({
  jsRuntime,
  input,
  globalScope,
  env = {},
}: UseEvaluateLiveBindingEntries): [string, LiveBinding][] {
  return React.useMemo(() => {
    return evaluateBindableAttrEntries(jsRuntime, input, globalScope, env);
  }, [jsRuntime, input, globalScope, env]);
}
