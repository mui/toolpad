import * as React from 'react';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return false;
}

function getServerSnapshot() {
  return true;
}

/**
 * Returns true when serverside rendering, or when hydrating.
 */
export default function useSsr() {
  return React.useSyncExternalStore<boolean>(subscribe, getSnapshot, getServerSnapshot);
}
