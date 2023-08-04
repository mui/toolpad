import { isValidJsIdentifier } from '@mui/toolpad-utils/strings';
// Basic implementation of https://datatracker.ietf.org/doc/html/rfc6901

export type DecodedPath = (string | number)[];

function decodeSegment(segment: string): string | number {
  const decodedSegment = segment.replaceAll(/~0/g, '/').replaceAll(/~1/g, '~');
  if (!decodedSegment) {
    return decodedSegment;
  }
  const asNumber = Number(decodedSegment);
  return Number.isNaN(asNumber) ? decodedSegment : asNumber;
}

function encodeSegment(segment: string | number): string {
  return String(segment).replaceAll('~', '~0').replaceAll('/', '~1');
}

/**
 * Decodes a JSON pointer into an array of segments.
 */
export function decode(pointer: string): DecodedPath {
  const [first, ...parts] = pointer.split('/');
  if (first !== '') {
    throw new Error(`Invalid JSON pointer "${pointer}"`);
  }
  return parts.map((segment) => decodeSegment(segment));
}

/**
 * Encodes an array of segments into a JSON pointer.
 */
export function encode(segments: DecodedPath): string {
  return ['', ...segments.map((segment) => encodeSegment(segment))].join('/');
}

/**
 * Gets a nested value from an object using a JSON pointer.
 */
export function resolve(object: unknown, pointer: string | DecodedPath): unknown {
  const segments = Array.isArray(pointer) ? pointer : decode(pointer);

  if (typeof object !== 'object' || object === null) {
    throw new Error(`Cannot get value from non-object at "${pointer}"`);
  }

  return segments.reduce((result: unknown, segment, i) => {
    if (result && typeof result === 'object') {
      return (result as Record<PropertyKey, unknown>)[segment];
    }
    const currentPointer = encode(segments.slice(0, i));
    throw new Error(`Cannot get value from non-object at "${currentPointer}"`);
  }, object);
}

/**
 * Build an expression that can be used to access a nested value from an object when evaluated.
 */
export function toExpression(name: string, pointer: string | DecodedPath): string {
  const segments = Array.isArray(pointer) ? pointer : decode(pointer);
  return `${name}${segments
    .map((segment) => {
      if (typeof segment === 'string' && isValidJsIdentifier(segment)) {
        return `.${segment}`;
      }
      return `[${JSON.stringify(segment)}]`;
    })
    .join('')}`;
}

export interface GenerateSuggestionsOptions {
  max?: number;
  filter?: (value: unknown) => boolean;
}

function* generatePointerSuggestions(
  obj: unknown,
  options: GenerateSuggestionsOptions,
  prefix: DecodedPath,
): Generator<DecodedPath> {
  if (!options.filter || (options.filter && options.filter(obj))) {
    yield prefix;
  }

  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i += 1) {
        yield* generatePointerSuggestions(obj[i], options, [...prefix, i]);
      }
    } else {
      for (const key of Object.keys(obj)) {
        yield* generatePointerSuggestions((obj as Record<PropertyKey, unknown>)[key], options, [
          ...prefix,
          key,
        ]);
      }
    }
  }
}

function* take<T>(generator: Generator<T>, max: number): Generator<T> {
  let i = 0;
  for (const item of generator) {
    if (i >= max) {
      return;
    }
    i += 1;
    yield item;
  }
}

export interface Suggestion {
  pointer: string;
  depth: number;
}

export function generateSuggestions(
  obj: unknown,
  options: GenerateSuggestionsOptions = {},
): Suggestion[] {
  const pointers = generatePointerSuggestions(obj, options, []);
  return Array.from(take(pointers, options.max ?? 1000), (pointer) => ({
    pointer: encode(pointer),
    depth: pointer.length,
  }));
}
