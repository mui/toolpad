import * as React from 'react';

export interface ConformanceOptions {
  refInstanceof: any;
  inheritComponent?: React.ElementType;
  skip?: Array<'themeDefaultProps'>;
}

export default function describeConformance(
  minimalElement: React.ReactElement<any>,
  getOptions: () => ConformanceOptions,
) {}
