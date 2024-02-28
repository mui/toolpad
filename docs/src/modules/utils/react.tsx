import * as React from 'react';
import * as ReactIs from 'react-is';

/**
 * Like `Array.prototype.join`, but for React nodes.
 */
export function interleave(items: React.ReactNode[], separator: React.ReactNode): React.ReactNode {
  const result: React.ReactNode[] = [];

  for (let i = 0; i < items.length; i += 1) {
    if (i > 0) {
      if (ReactIs.isElement(separator)) {
        result.push(React.cloneElement(separator, { key: `separator-${i}` }));
      } else {
        result.push(separator);
      }
    }

    const item = items[i];
    result.push(item);
  }

  return <React.Fragment>{result}</React.Fragment>;
}
