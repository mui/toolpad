import * as React from 'react';
import { useConnectionContext } from './context';
import client from '../api';

export interface UseQueryPreviewOptions<R> {
  onPreview?: (result: R) => void;
}

export default function useQueryPreview<PQ, R>(
  privateQuery: PQ,
  { onPreview = () => {} }: UseQueryPreviewOptions<R> = {},
) {
  const { appId, dataSourceId, connectionId } = useConnectionContext();
  const [preview, setPreview] = React.useState<R | null>(null);

  const cancelRunPreview = React.useRef<(() => void) | null>(null);
  const runPreview = React.useCallback(() => {
    let canceled = false;

    cancelRunPreview.current?.();
    cancelRunPreview.current = () => {
      canceled = true;
    };

    client.query
      .dataSourceFetchPrivate(appId, dataSourceId, connectionId, privateQuery)
      .then((result) => {
        if (!canceled) {
          setPreview(result);
          onPreview?.(result);
        }
      })
      .finally(() => {
        cancelRunPreview.current = null;
      });
  }, [appId, dataSourceId, connectionId, privateQuery, onPreview]);

  return { preview, runPreview };
}
