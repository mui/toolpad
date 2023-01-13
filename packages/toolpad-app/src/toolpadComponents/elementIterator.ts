import { ElementIteratorItem, ToolpadComponents, TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { getElementNodeComponentId } from '.';
import * as appDom from '../appDom';

export const getElementIteratorBindingId = (node: appDom.AppDomNode) => `${node.id}.item`;

export const getElementIteratorScopePath = (node: appDom.AppDomNode) => `${node.name}Item`;

export const getFirstElementIteratorAncestorItems = (
  dom: appDom.AppDom,
  elementNode: appDom.ElementNode,
  components: ToolpadComponents,
): ElementIteratorItem[] | null => {
  const ancestorComponents = [...appDom.getAncestors(dom, elementNode), elementNode];

  let firstIteratorAncestorItems: ElementIteratorItem[] | null = null;
  ancestorComponents.reverse().forEach((ancestor, index) => {
    if (firstIteratorAncestorItems) {
      return;
    }

    const parentProp = ancestor.parentProp;

    const parent = ancestorComponents[index + 1];

    const ParentComponent =
      parent && appDom.isElement(parent) ? components[getElementNodeComponentId(parent)] : null;
    const parentComponentArgTypes = ParentComponent?.[TOOLPAD_COMPONENT].argTypes;

    const parentArgTypeDef =
      (parentComponentArgTypes && parentProp && parentComponentArgTypes[parentProp]?.typeDef) ||
      null;

    if (parent && parentArgTypeDef?.type === 'elementIterator') {
      const { itemsProp } = parentArgTypeDef;
      const parentProps = (parent as appDom.ElementNode).props;

      firstIteratorAncestorItems = (parentProps && parentProps[itemsProp]?.value) || null;
    }
  });

  return firstIteratorAncestorItems;
};
