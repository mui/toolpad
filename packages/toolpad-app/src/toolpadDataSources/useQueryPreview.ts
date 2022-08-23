import * as React from 'react';
import useFetchPrivate from './useFetchPrivate';

export interface UseQueryPreviewOptions<R> {
  onPreview?: (result: R) => void;
}

export default function useQueryPreview<PQ, R>(
  privateQuery: PQ,
  { onPreview = () => {} }: UseQueryPreviewOptions<R> = {},
) {
  const [preview, setPreview] = React.useState<R | null>(null);

  const fetchPrivate = useFetchPrivate<PQ, R>();

  const cancelRunPreview = React.useRef<(() => void) | null>(null);
  const runPreview = React.useCallback(() => {
    let canceled = false;

    cancelRunPreview.current?.();
    cancelRunPreview.current = () => {
      canceled = true;
    };

    fetchPrivate(privateQuery)
      .then((result) => {
        if (!canceled) {
          setPreview(result);
          onPreview?.(result);
        }
      })
      .finally(() => {
        cancelRunPreview.current = null;
      });
  }, [fetchPrivate, privateQuery, onPreview]);

  return { preview, runPreview };
}
