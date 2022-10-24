import * as React from 'react';
import * as appDom from '../../../appDom';

function validateNodeName(name: string, disallowedNames: Set<string>, kind: string) {
  const isUnique = !disallowedNames.has(name);
  return name
    ? appDom.validateNodeName(name, `a ${kind} name`) ||
        (isUnique ? null : `There already is a ${kind} with this name`)
    : 'a name is required';
}

export function useNodeNameValidation(name: string, disallowedNames: Set<string>, kind: string) {
  return React.useMemo(
    () => validateNodeName(name, disallowedNames, kind),
    [name, disallowedNames, kind],
  );
}
