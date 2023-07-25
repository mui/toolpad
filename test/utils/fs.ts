import * as fs from 'fs/promises';

export async function withTemporaryEdits<T = void>(
  filePath: string,
  doWork: () => Promise<T>,
): Promise<T> {
  const originalContent = await fs.readFile(filePath);
  try {
    return await doWork();
  } finally {
    await fs.writeFile(filePath, originalContent);
  }
}
