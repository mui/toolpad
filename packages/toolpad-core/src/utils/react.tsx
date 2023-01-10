import * as React from 'react';

/**
 * Context that throws when used outside of a provider.
 */
export function createProvidedContext<T>(
  name: string,
): [() => T, React.ComponentType<React.ProviderProps<T>>] {
  const context = React.createContext<T | undefined>(undefined);

  const useContext = () => {
    const maybeContext = React.useContext(context);
    if (!maybeContext) {
      throw new Error(`context "${name}" was used without a Provider`);
    }
    return maybeContext;
  };

  return [useContext, context.Provider as React.ComponentType<React.ProviderProps<T>>];
}
