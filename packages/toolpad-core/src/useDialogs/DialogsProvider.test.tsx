/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test } from 'vitest';
import describeConformance from '@toolpad/utils/describeConformance';
import { DialogsProvider } from './DialogsProvider';

describe('DialogsProvider', () => {
  describeConformance(<DialogsProvider />, () => ({
    skip: ['themeDefaultProps'],
  }));

  test('dummy test', () => {});
});
