import * as React from 'react';
import ExamplesFeatured from 'docs-toolpad/src/modules/components/examples/ExamplesFeatured';
import coreExamples from 'docs-toolpad/src/modules/components/examples/coreExamples';

export default function CoreFeaturedExamples() {
  return <ExamplesFeatured examples={coreExamples} />;
}
