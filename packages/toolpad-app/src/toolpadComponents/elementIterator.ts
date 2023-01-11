import { ArgTypeDefinitions, IteratorItem, PropValueType } from '@mui/toolpad-core';
import { PageViewState } from '../types';
import * as appDom from '../appDom';

export const getFirstElementIteratorAncestorItems = (
  dom: appDom.AppDom,
  elementNode: appDom.ElementNode,
  viewState: PageViewState,
): IteratorItem[] | null => {
  const ancestorComponents = appDom.getAncestors(dom, elementNode);

  let firstIteratorAncestorItems: IteratorItem[] | null = null;
  ancestorComponents.forEach((ancestor, index) => {
    if (firstIteratorAncestorItems) {
      return;
    }

    const parentProp = ancestor.parentProp;

    const parent = ancestorComponents[index - 1];
    const parentNodeInfo = parent && viewState.nodes[parent.id];
    const parentComponentConfig = parentNodeInfo?.componentConfig;
    const parentComponentArgTypes:
      | ArgTypeDefinitions<{ [parentProp: string]: PropValueType }>
      | undefined = parentComponentConfig?.argTypes;

    const argTypeDef =
      (parentComponentArgTypes && parentProp && parentComponentArgTypes[parentProp]?.typeDef) ||
      null;

    if (parent && argTypeDef?.type === 'elementIterator') {
      const { itemsProp } = argTypeDef;
      const parentProps = (parent as appDom.ElementNode).props;

      firstIteratorAncestorItems = (parentProps && parentProps[itemsProp]?.value) || null;
    }
  });

  return firstIteratorAncestorItems;
};
