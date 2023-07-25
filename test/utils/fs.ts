import * as fs from 'fs/promises';

export async function withTemporaryEdits<T = void>(
  filePath: string,
  doWork: () => Promise<T>,
): Promise<T> {
  const envOriginal = await fs.readFile(filePath, 'utf-8');
  try {
    return await doWork();
  } finally {
    await fs.writeFile(filePath, envOriginal);
  }
}
