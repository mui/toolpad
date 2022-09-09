import { ExecFetchResult } from '@mui/toolpad-core';
import * as React from 'react';
import { errorFrom, serializeError } from '../utils/errors';
import useFetchPrivate from './useFetchPrivate';

export interface UseQueryPreviewOptions<R> {
  onPreview?: (result: R) => void;
}

export default function useQueryPreview<PQ, R extends ExecFetchResult<any> & Partial<any>>(
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
      .then(
        (result) => {
          if (!canceled) {
            setPreview(result);
            onPreview?.(result);
          }
        },
        (error) => {
          setPreview({ error: serializeError(errorFrom(error)) } as R);
        },
      )
      .finally(() => {
        cancelRunPreview.current = null;
      });
  }, [fetchPrivate, privateQuery, onPreview]);

  return { preview, runPreview };
}
