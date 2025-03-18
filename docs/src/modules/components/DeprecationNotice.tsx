/* eslint-disable material-ui/no-hardcoded-labels */
import * as React from 'react';
import { MarkdownElement } from '@mui/docs/MarkdownElement';
import Link from 'next/link';

export default function DeprecationNotice() {
  return (
    <MarkdownElement>
      <div className="MuiCallout-root MuiCallout-warning">
        <div className="MuiCallout-icon-container">
          <svg
            focusable="false"
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-testid="ContentCopyRoundedIcon"
          >
            <use className="MuiCode-copied-icon" xlinkHref="#warning-icon" />
          </svg>
        </div>
        <div className="MuiCallout-content">
          <p>
            Toolpad Studio has been deprecated. Please use <Link href="/toolpad/">Toopad Core</Link>{' '}
            instead.
          </p>
        </div>
      </div>
    </MarkdownElement>
  );
}
