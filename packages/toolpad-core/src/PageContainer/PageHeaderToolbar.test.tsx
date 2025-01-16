/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test } from 'vitest';
import describeConformance from '@toolpad/utils/describeConformance';
import { PageHeaderToolbar } from './PageHeaderToolbar';

describe('PageHeaderToolbar', () => {
  describeConformance(<PageHeaderToolbar />, () => ({
    skip: ['themeDefaultProps'],
  }));

  test('dummy test', () => {});
});
