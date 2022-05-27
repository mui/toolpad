export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function distanceToPoint(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function distanceToRect(rect: Rectangle, x: number, y: number) {
  const left = rect.x;
  const top = rect.y;
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  if (x < left && y < top) {
    return distanceToPoint(x, y, left, top);
  }
  if (x > right && y < top) {
    return distanceToPoint(x, y, right, top);
  }
  if (x > right && y > bottom) {
    return distanceToPoint(x, y, right, bottom);
  }
  if (x < left && y > bottom) {
    return distanceToPoint(x, y, left, bottom);
  }
  if (x < left) {
    return left - x;
  }
  if (x > right) {
    return x - right;
  }
  if (y < top) {
    return top - y;
  }
  if (y > bottom) {
    return y - bottom;
  }
  return 0;
}

// All credit goes to https://stackoverflow.com/a/6853926/419436
// I was too lazy to figure out the math
export function distanceToLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
): number {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq > 0) {
    // in case of 0 length line
    param = dot / lenSq;
  }

  let xx;
  let yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function absolutePositionCss({ x, y, width, height }: Rectangle): React.CSSProperties {
  return { left: x, top: y, width, height };
}

// Returns the bounding client rect of an element against another element.
export function getRelativeBoundingRect(containerElm: Element, childElm: Element): Rectangle {
  const containerRect = containerElm.getBoundingClientRect();
  const childRect = childElm.getBoundingClientRect();

  return {
    x: childRect.x - containerRect.x,
    y: childRect.y - containerRect.y,
    width: childRect.width,
    height: childRect.height,
  };
}

// Returns the bounding box of an element against another element.
// Considers the box model to return the full dimensions, including padding/border/margin.
export function getRelativeOuterRect(containerElm: Element, childElm: Element): Rectangle {
  const { x, y, width, height } = getRelativeBoundingRect(containerElm, childElm);
  const styles = window.getComputedStyle(childElm);

  let offsetLeft = parseFloat(styles.marginLeft);
  let offsetRight = parseFloat(styles.marginRight);
  let offsetTop = parseFloat(styles.marginTop);
  let offsetBottom = parseFloat(styles.marginBottom);

  if (styles.boxSizing === 'content-box') {
    offsetLeft += parseFloat(styles.paddingLeft) + parseFloat(styles.borderLeftWidth);
    offsetRight += parseFloat(styles.paddingRight) + parseFloat(styles.borderRightWidth);
    offsetTop += parseFloat(styles.paddingTop) + parseFloat(styles.borderTopWidth);
    offsetBottom += parseFloat(styles.paddingBottom) + parseFloat(styles.borderBottomWidth);
  }

  return {
    x: x - offsetLeft,
    y: y - offsetTop,
    width: width + offsetLeft + offsetRight,
    height: height + offsetTop + offsetBottom,
  };
}

export function rectContainsPoint(rect: Rectangle, x: number, y: number): boolean {
  return rect.x <= x && rect.x + rect.width >= x && rect.y <= y && rect.y + rect.height >= y;
}

export enum RectBoundary {
  TOP = 'TOP',
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  LEFT = 'LEFT',
}

interface GetRectPointBoundaryOptions {
  ignoreCenterAreaXFraction?: number // 0-1
  ignoreCenterAreaYFraction?: number // 0-1
}

export function getRectPointBoundary(rect: Rectangle, x: number, y: number, options: GetRectPointBoundaryOptions = {}): RectBoundary | null {
  const { height: rectHeight, width: rectWidth } = rect
  const { ignoreCenterAreaXFraction = 0, ignoreCenterAreaYFraction = 0 } = options

  // Out of bounds
  if (x < 0 || x > rectWidth || y < 0 || y > rectHeight) {
    return null;
  }

  // Ignored center area fractions
  const fractionalX = x / rectWidth
  const fractionalY = y / rectHeight
  const includedCenterAreaXFractionHalf = (1 - ignoreCenterAreaXFraction) / 2
  const includedCenterAreaYFractionHalf = (1 - ignoreCenterAreaYFraction) / 2
  if (
    fractionalX > includedCenterAreaXFractionHalf &&
    fractionalX < 1 - includedCenterAreaXFractionHalf &&
    fractionalY > includedCenterAreaYFractionHalf &&
    fractionalY < 1 - includedCenterAreaYFractionHalf
  ) {
    return null
  }

  const isOverFirstDiagonal = y < (rectHeight / rectWidth) * x;
  const isOverSecondDiagonal = y < -1 * (rectHeight / rectWidth) * x + rectHeight;

  if (isOverFirstDiagonal && isOverSecondDiagonal) {
    return RectBoundary.TOP;
  }
  if (isOverFirstDiagonal) {
    return RectBoundary.RIGHT;
  }
  if (isOverSecondDiagonal) {
    return RectBoundary.LEFT;
  }
  return RectBoundary.BOTTOM;
}
