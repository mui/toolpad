import { NextApiHandler } from 'next';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs/promises';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { findUp } from 'find-up';

function asArray<T>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

function parsePath(modulePath: string): { module: string; subPath: string } {
  const segments = modulePath.split(path.sep);
  const moduleSegments = segments[0].startsWith('@') ? 2 : 1;
  return {
    module: path.join(...segments.slice(0, moduleSegments)),
    subPath: path.join(...segments.slice(moduleSegments)),
  };
}

async function getPackageRelative(filePath: string): Promise<string> {
  const pkgPath = await findUp('package.json', {
    cwd: path.dirname(filePath),
  });
  if (!pkgPath) {
    throw new Error('Not a package');
  }

  return path.normalize(path.relative(path.dirname(pkgPath), filePath));
}

export default (async (req, res) => {
  const requested = path.normalize(asArray(req.query.path).join(path.sep));
  const { module, subPath } = parsePath(requested);

  try {
    const filePath = await importMetaResolve(requested, import.meta.url);
    const resolved = await getPackageRelative(url.fileURLToPath(filePath));
    if (resolved === requested) {
      const file = await fs.readFile(url.fileURLToPath(resolved), { encoding: 'utf-8' });
      res.setHeader('content-type', 'application/javascript');
      res.send(file);
      return;
    }
    res.redirect(`/api/esm/${module}/${resolved}`);
  } catch (err) {
    const pkgPath = await importMetaResolve(`${module}/package.json`, import.meta.url);
    const filePath = path.resolve(path.dirname(url.fileURLToPath(pkgPath)), subPath);
    const file = await fs.readFile(filePath, { encoding: 'utf-8' });
    res.setHeader('content-type', 'application/javascript');
    res.send(file);
  }
}) as NextApiHandler<string>;
