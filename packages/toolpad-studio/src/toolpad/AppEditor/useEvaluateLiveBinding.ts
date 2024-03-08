import {
  BindableAttrEntries,
  BindableAttrValue,
  BindableAttrValues,
  JsRuntime,
  LiveBinding,
} from '@toolpad/studio-runtime';
import * as React from 'react';
import { evaluateBindable } from '@toolpad/studio-runtime/jsRuntime';
import { mapValues } from '@toolpad/utils/collections';

function evaluateBindableAttrEntries(
  jsRuntime: JsRuntime,
  input: BindableAttrEntries,
  globalScope: Record<string, unknown>,
): [string, LiveBinding][] {
  return input.map(([key, bindable]) => [
    key,
    evaluateBindable(jsRuntime, bindable || null, globalScope),
  ]);
}

function evaluateBindableAttrValues(
  jsRuntime: JsRuntime,
  input: BindableAttrValues<any>,
  globalScope: Record<string, unknown>,
): Record<string, LiveBinding> {
  return mapValues(input, (bindable) => evaluateBindable(jsRuntime, bindable || null, globalScope));
}

export interface UseEvaluateLiveBinding {
  jsRuntime: JsRuntime;
  input: BindableAttrValue<any> | null;
  globalScope: Record<string, unknown>;
}

export function useEvaluateLiveBinding({
  jsRuntime,
  input,
  globalScope,
}: UseEvaluateLiveBinding): LiveBinding {
  return React.useMemo(() => {
    return evaluateBindable(jsRuntime, input, globalScope);
  }, [jsRuntime, input, globalScope]);
}

export interface UseEvaluateLiveBindings {
  jsRuntime: JsRuntime;
  server?: boolean;
  input: BindableAttrValues<any>;
  globalScope: Record<string, unknown>;
}

export function useEvaluateLiveBindings({
  jsRuntime,
  input,
  globalScope,
}: UseEvaluateLiveBindings): Partial<Record<string, LiveBinding>> {
  return React.useMemo(() => {
    return evaluateBindableAttrValues(jsRuntime, input, globalScope);
  }, [jsRuntime, input, globalScope]);
}

export interface UseEvaluateLiveBindingEntries {
  jsRuntime: JsRuntime;
  input: BindableAttrEntries;
  globalScope: Record<string, unknown>;
}

export function useEvaluateLiveBindingEntries({
  jsRuntime,
  input,
  globalScope,
}: UseEvaluateLiveBindingEntries): [string, LiveBinding][] {
  return React.useMemo(() => {
    return evaluateBindableAttrEntries(jsRuntime, input, globalScope);
  }, [jsRuntime, input, globalScope]);
}
