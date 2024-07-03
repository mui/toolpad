/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe } from 'vitest';
import describeConformance from '@toolpad/utils/describeConformance';
import { PageContentToolbar } from './PageContentToolbar';

describe('PageContentToolbar', () => {
  describeConformance(<PageContentToolbar />, () => ({
    skip: ['themeDefaultProps'],
  }));
});
