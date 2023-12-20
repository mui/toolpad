import * as React from 'react';
import { errorFrom } from '@mui/toolpad-utils/errors';

export interface UseQueryPreviewOptions<R> {
  onPreview?: (result: R) => void;
}

export interface QueryPreviewResult<T> {
  data?: T;
  error?: Error;
}

export default function useQueryPreview<Q, P, R extends QueryPreviewResult<any> & Partial<any>>(
  dofetch: (query: Q, params: P) => Promise<R>,
  query: Q,
  params: P,
  { onPreview }: UseQueryPreviewOptions<R> = {},
) {
  const [preview, setPreview] = React.useState<R | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const cancelRunPreview = React.useRef<(() => void) | null>(null);
  const runPreview = React.useCallback(() => {
    let canceled = false;

    cancelRunPreview.current?.();
    cancelRunPreview.current = () => {
      canceled = true;
    };

    setIsLoading(true);
    dofetch(query, params)
      .then(
        (result) => {
          if (!canceled) {
            setPreview(result);
            onPreview?.(result);
          }
        },
        (error) => {
          setPreview({ error: errorFrom(error) } as R);
        },
      )
      .finally(() => {
        setIsLoading(false);
        cancelRunPreview.current = null;
      });
  }, [dofetch, query, params, onPreview]);

  return { preview, runPreview, isLoading };
}
