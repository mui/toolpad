export function scrollIntoViewIfNeeded(target: Element) {
  if (target.getBoundingClientRect().bottom > window.innerHeight) {
    target.scrollIntoView(false);
  }
  if (target.getBoundingClientRect().top < 0) {
    target.scrollIntoView();
  }
}
