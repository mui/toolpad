const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];

export function getExtension(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex < 0 ? '' : fileName.substring(dotIndex);
}

export function hasImageExtension(pathName: string): boolean {
  const extension = getExtension(pathName);
  return IMAGE_EXTENSIONS.includes(extension);
}
