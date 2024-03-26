import path from 'path';
import fs from 'fs/promises';

export default async function writeFiles(
  absolutePath: string,
  files: Map<string, { content: string }>,
): Promise<void> {
  // Get all directories and deduplicate
  const dirs = new Set(Array.from(files.keys(), (filePath) => path.dirname(filePath)));

  // Create directories, use recursive option to create parent directories
  await Promise.all(
    Array.from(dirs, (dirPath) => fs.mkdir(path.join(absolutePath, dirPath), { recursive: true })),
  );

  // Write all the files
  await Promise.all(
    Array.from(files.entries(), ([filePath, { content }]) =>
      fs.writeFile(path.join(absolutePath, filePath), content),
    ),
  );
}
