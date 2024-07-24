/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test } from 'vitest';
import describeConformance from '@toolpad/utils/describeConformance';
import { PageContainerToolbar } from './PageContainerToolbar';

describe('PageContainerToolbar', () => {
  describeConformance(<PageContainerToolbar />, () => ({
    skip: ['themeDefaultProps'],
  }));

  test('dummy test', () => {});
});
