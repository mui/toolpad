import path from 'path-browserify';

function isValidFileNAme(base: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(base);
}

export function getComponentNameFromInputFile(filePath: string): string {
  const name = path.basename(filePath, '.yml');

  if (!isValidFileNAme(name)) {
    throw new Error(`Invalid file name ${JSON.stringify(name)}`);
  }

  return name;
}

export function getOutputPathForInputFile(filePath: string, outDir = '/') {
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  return path.join(outDir, path.dirname(filePath), base, 'index.tsx');
}
