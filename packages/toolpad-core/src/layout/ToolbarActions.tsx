'use client';
import * as React from 'react';
import { Account } from '../Account';
import { ThemeSwitcher } from './ThemeSwitcher';

function ToolbarActions() {
  return (
    <React.Fragment>
      <ThemeSwitcher />
      <Account />
    </React.Fragment>
  );
}

export { ToolbarActions };
