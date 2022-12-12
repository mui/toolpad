import * as React from 'react';

export default function useEventListener<K extends keyof DocumentEventMap>(
  eventType: K,
  handleEvent: (this: Document, ev: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
  eventListenerDocument = document,
) {
  React.useEffect(() => {
    eventListenerDocument.addEventListener(eventType, handleEvent, options);
    return () => {
      eventListenerDocument.removeEventListener(eventType, handleEvent, options);
    };
  }, [eventListenerDocument, eventType, handleEvent, options]);
}
