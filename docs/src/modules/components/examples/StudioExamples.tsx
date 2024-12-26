import * as React from 'react';
import ExamplesGrid from 'docs-toolpad/src/modules/components/examples/ExamplesGrid';
import studioExamples from 'docs-toolpad/src/modules/components/examples/studioExampless';

export default function StudioExamples() {
  return <ExamplesGrid examplesFile={studioExamples()} />;
}
