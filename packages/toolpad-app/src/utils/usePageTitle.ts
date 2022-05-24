import * as React from 'react';

export default function usePageTitle(title: string) {
  React.useEffect(() => {
    const original = document.title;
    document.title = title;
    return () => {
      document.title = original;
    };
  }, [title]);
}
