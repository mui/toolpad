/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * Do not use in a security critical context.
 *
 * @see https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 */
export default function insecureHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}
