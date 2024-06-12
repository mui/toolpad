/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, waitFor, within, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  test('notifies', async () => {
    console.log('stub');
  });
});
