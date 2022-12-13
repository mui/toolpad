const SINGLE_ACTION_INPUT_TYPES = ['checkbox', 'radio', 'range', 'color'];

export function hasFieldFocus(documentTarget = document): boolean {
  const activeElement = documentTarget.activeElement as HTMLElement | HTMLInputElement;

  if (!activeElement) {
    return false;
  }
  const { nodeName, contentEditable } = activeElement;

  const type = activeElement.getAttribute('type') || '';

  const focusedInput = nodeName === 'INPUT' && !SINGLE_ACTION_INPUT_TYPES.includes(type);
  const focusedTextarea = nodeName === 'TEXTAREA';
  const focusedContentEditable = contentEditable === 'true';

  return focusedInput || focusedTextarea || focusedContentEditable;
}
