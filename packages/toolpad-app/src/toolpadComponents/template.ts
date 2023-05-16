import { ArgTypeDefinitions, PropValueType } from '@mui/toolpad-core';

import * as appDom from '../appDom';
import { PageViewState } from '../types';

export const isTemplateDescendant = (
  dom: appDom.AppDom,
  elementNode: appDom.ElementNode,
  viewState: PageViewState,
): boolean => {
  const ancestors = appDom.getAncestors(dom, elementNode);

  for (const [index, ancestor] of ancestors.entries()) {
    const parentProp = ancestor.parentProp;

    const parent = ancestors[index - 1];
    const parentNodeInfo = parent && viewState.nodes[parent.id];
    const parentComponentConfig = parentNodeInfo?.componentConfig;
    const parentComponentArgTypes:
      | ArgTypeDefinitions<{ [parentProp: string]: PropValueType }>
      | undefined = parentComponentConfig?.argTypes;

    const argTypeDef =
      (parentComponentArgTypes && parentProp && parentComponentArgTypes[parentProp]) || null;

    if (parent && argTypeDef?.type === 'template') {
      return true;
    }
  }

  return false;
};
