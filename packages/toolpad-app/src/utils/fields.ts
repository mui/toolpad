export const hasFieldFocus = (documentTarget = document) => {
  const activeElement = documentTarget.activeElement as HTMLElement;

  if (!activeElement) {
    return false;
  }
  const { nodeName, contentEditable } = activeElement;

  const focusedInput = nodeName === 'INPUT';
  const focusedTextarea = nodeName === 'TEXTAREA';
  const focusedContentEditable = contentEditable === 'true';

  return focusedInput || focusedTextarea || focusedContentEditable;
};
