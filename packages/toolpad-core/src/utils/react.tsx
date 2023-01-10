import * as React from 'react';

/**
 * Consume a context but throw when used outside of a provider.
 */
export function useNonNullableContext<T>(context: React.Context<T>, name?: string): NonNullable<T> {
  const maybeContext = React.useContext(context);
  if (maybeContext === null || maybeContext === undefined) {
    throw new Error(`context "${name}" was used without a Provider`);
  }
  return maybeContext;
}

/**
 * Context that throws when used outside of a provider.
 */
export function createProvidedContext<T>(
  name?: string,
): [() => T, React.ComponentType<React.ProviderProps<T>>] {
  const context = React.createContext<T | undefined>(undefined);
  const useContext = () => useNonNullableContext(context, name);
  return [useContext, context.Provider as React.ComponentType<React.ProviderProps<T>>];
}
