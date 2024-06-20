export interface Codec<V> {
  parse: (value: string) => V;
  stringify: (value: V) => string;
}

export const CODEC_DATE: Codec<Date> = {
  parse: (value) => new Date(value),
  stringify: (value) => value.toISOString(),
};

export const CODEC_DATE_ONLY: Codec<Date> = {
  parse: (value) => new Date(value),
  stringify: (value) => value.toISOString().split('T')[0],
};

export const CODEC_NUMBER: Codec<number> = {
  parse: (value) => Number(value),
  stringify: (value) => String(value),
};

export const CODE_BOOLEAN: Codec<boolean> = {
  parse: (value) => value === 'true',
  stringify: (value) => String(value),
};

export const CODEC_JSON: Codec<unknown> = {
  parse: (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },
  stringify: (value) => JSON.stringify(value),
};

export const CODEC_JSON_STRICT: Codec<unknown> = {
  parse: (value) => JSON.parse(value),
  stringify: (value) => JSON.stringify(value),
};

export const CODEC_STRING: Codec<string> = {
  parse: (value) => value,
  stringify: (value) => value,
};
