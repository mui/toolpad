import * as React from 'react';

export interface ConformanceOptions {
  refInstanceof?: unknown;
  inheritComponent?: React.ElementType;
  skip?: Array<'themeDefaultProps'>;
}

export default function describeConformance(
  minimalElement: React.ReactElement<unknown>,
  getOptions: () => ConformanceOptions,
) {
  getOptions();
}
