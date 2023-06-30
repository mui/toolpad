export type ParsedFunctionId =
  | {
      file: string;
      handler?: undefined;
    }
  | {
      file: string;
      handler: string;
    };

export function parseLegacyFunctionId(id: string): ParsedFunctionId {
  const [file, handler] = id.split('#');
  return handler ? { file, handler } : { file: 'functions.ts', handler: file };
}

export function parseFunctionId(id: string): ParsedFunctionId {
  const [file, handler] = id.split('#');
  return handler ? { file, handler } : { file };
}

export function serializeFunctionId({ file, handler }: ParsedFunctionId): string {
  return handler ? `${file}#${handler}` : file;
}
