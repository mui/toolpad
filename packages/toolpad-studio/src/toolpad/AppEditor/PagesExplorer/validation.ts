import * as React from 'react';
import * as appDom from '@toolpad/studio-runtime/appDom';

export function useNodeNameValidation(name: string, disallowedNames: Set<string>, kind: string) {
  return React.useMemo(
    () => appDom.validateNodeName(name, disallowedNames, kind),
    [name, disallowedNames, kind],
  );
}
