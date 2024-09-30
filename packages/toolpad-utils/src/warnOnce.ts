const history = new Set<string>();

/**
 * Warns only once for a specific message.
 * @param msg The message to warn.
 */
export default function warnOnce(msg: string) {
  if (!history.has(msg)) {
    history.add(msg);
    console.warn(msg);
  }
}
