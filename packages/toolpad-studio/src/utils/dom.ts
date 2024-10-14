export function scrollIntoViewIfNeeded(target: Element, options?: boolean | ScrollIntoViewOptions) {
  if (target.getBoundingClientRect().bottom > window.innerHeight) {
    target.scrollIntoView(options ?? false);
  }
  if (target.getBoundingClientRect().top < 0) {
    target.scrollIntoView(options);
  }
}
