import * as React from 'react';
import * as appDom from '../../../appDom';

export function useNameInputError(name: string, disallowedNames: Set<string>, kind: string) {
  const isUnique = React.useMemo(() => !disallowedNames.has(name), [disallowedNames, name]);
  const inputErrorMsg = React.useMemo(() => {
    return name
      ? appDom.validateNodeName(name, `a ${kind} name`) ||
          (isUnique ? null : `There already is a ${kind} with this name`)
      : 'a name is required';
  }, [name, kind, isUnique]);
  return inputErrorMsg;
}
