import { ExecFetchResult } from '@mui/toolpad-core';
import * as React from 'react';
import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';

export interface UseQueryPreviewOptions<R> {
  onPreview?: (result: R) => void;
}

export default function useQueryPreview<Q, P, R extends ExecFetchResult<any> & Partial<any>>(
  dofetch: (query: Q, params: P) => Promise<R>,
  query: Q,
  params: P,
  { onPreview = () => {} }: UseQueryPreviewOptions<R> = {},
) {
  const [preview, setPreview] = React.useState<R | null>(null);
  const [isLoading, setIsloading] = React.useState(false);

  const cancelRunPreview = React.useRef<(() => void) | null>(null);
  const runPreview = React.useCallback(() => {
    let canceled = false;

    cancelRunPreview.current?.();
    cancelRunPreview.current = () => {
      canceled = true;
    };

    setIsloading(true);
    dofetch(query, params)
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
        setIsloading(false);
        cancelRunPreview.current = null;
      });
  }, [dofetch, query, params, onPreview]);

  return { preview, runPreview, isLoading };
}
