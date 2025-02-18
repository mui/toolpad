'use client';
import * as React from 'react';

/**
 * Sets the current document title.
 */
export default function usePageTitle(title: string) {
  React.useEffect(() => {
    const original = document.title;
    document.title = title;
    return () => {
      document.title = original;
    };
  }, [title]);
}
