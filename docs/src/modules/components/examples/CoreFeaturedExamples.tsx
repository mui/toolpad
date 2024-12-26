import * as React from 'react';
import FeaturedExamples from 'docs-toolpad/src/modules/components/examples/FeaturedExamples';
import coreExamples from 'docs-toolpad/src/modules/components/examples/coreExamples';

export default function CoreFeaturedExamples() {
  return <FeaturedExamples examplesFile={coreExamples()} />;
}
