import UTF8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';
import config from './config';

/*
 * Proposed strategy:
 * Secrets are encrypted if at least one key is provided. If no keys are provided, the secrets are not encrypted
 * When multiple keys are provided, each key is tried, in order, to decrypt the secret, first one to work wins
 * This will allow for seamless key rotation down the line:
 *   - add the new key as first in the list so that newly added or updated secrets use the new key
 *   - Manual command to de-encrypt all secrets with the old key and re-encrypt with the new key
 *     (ignore if secret can't be decrypted with the old key, it means it's already using the new key, or another old key)
 *   - remove the old key from the list
 */

const IDENTITY = <T>(value: T): T => value;

interface BoxedSecret {
  value: string;
}

function boxSecret(decoded: string): string {
  const boxed: BoxedSecret = { value: decoded };
  return JSON.stringify(boxed);
}

function unboxSecret(encoded: string): string {
  const boxed: BoxedSecret = JSON.parse(encoded);
  return boxed.value;
}

const encryptionMethod =
  config.encryptionKeys.length > 0
    ? (value: string): string => AES.encrypt(value, config.encryptionKeys[0]).toString()
    : IDENTITY;

const decryptionMethods: ((value: string) => string)[] = [
  IDENTITY,
  ...config.encryptionKeys.map((key) => {
    return (value: string) => AES.decrypt(value, key).toString(UTF8);
  }),
];

export function encryptSecret(value: string): string {
  return encryptionMethod(boxSecret(value));
}

export function decryptSecret(value: string): string {
  for (const decryptionMethod of decryptionMethods) {
    try {
      return unboxSecret(decryptionMethod(value));
    } catch {
      // ignore
    }
  }

  throw new Error(`Failed to decrypt secret`);
}
