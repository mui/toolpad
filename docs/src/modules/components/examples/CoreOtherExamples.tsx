import * as React from 'react';
import ExamplesGrid from 'docs-toolpad/src/modules/components/examples/ExamplesGrid';
import coreExamples from 'docs-toolpad/src/modules/components/examples/coreExamples';

export default function CoreOtherExamples() {
  return <ExamplesGrid examples={coreExamples} />;
}
