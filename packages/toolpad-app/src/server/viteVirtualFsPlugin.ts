import invariant from 'invariant';
import { Plugin, ViteDevServer, transformWithEsbuild } from 'vite';
import * as path from 'path';

const API_PROPERTY = Symbol('virtual-fs-api');

interface VirtualFsPluginApi {
  replaceFiles: (newFiles: Map<string, string>) => void;
}

export type VirtualFsPlugin = Plugin & { [API_PROPERTY]: VirtualFsPluginApi };

export default function virtualFsPlugin(
  initialFiles: Map<string, string>,
  userIdentifier: string,
): VirtualFsPlugin {
  const prefix = `virtual:${userIdentifier}:`;
  const resolvedPrefix = `\0${prefix}`;
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
  let serverInstance: ViteDevServer | undefined;
  let files = initialFiles;
  return {
    name: 'virtual-fs',

    enforce: 'pre',

    configureServer(server: ViteDevServer) {
      serverInstance = server;
    },

    resolveId(id: string, importer: string | undefined) {
      if (id.startsWith(prefix)) {
        const entryPath = id.slice(prefix.length);

        if (files.has(entryPath)) {
          return `${resolvedPrefix}${entryPath}`;
        }

        for (const extension of extensions) {
          const entryPathWithExtension = `${entryPath}${extension}`;
          if (files.has(entryPathWithExtension)) {
            return `${resolvedPrefix}${entryPathWithExtension}`;
          }
        }
      } else if (importer?.startsWith(resolvedPrefix)) {
        const importerPath = importer.slice(resolvedPrefix.length);
        const fullPath = path.resolve(path.dirname(importerPath), id);
        return this.resolve(`${prefix}${fullPath}`, importer);
      }
      return null;
    },

    async load(id) {
      if (id.startsWith(resolvedPrefix)) {
        const virtualPath = id.slice(resolvedPrefix.length);
        const content = files.get(virtualPath);
        invariant(content, `File ${virtualPath} not found under virtual fs "${userIdentifier}"`);
        const transformed = await transformWithEsbuild(content, virtualPath);
        return transformed;
      }
      return null;
    },

    [API_PROPERTY]: {
      async replaceFiles(newFiles: Map<string, string>) {
        const filesToInvalidate = [];
        for (const [virtualPath, content] of files) {
          if (!newFiles.has(virtualPath) || newFiles.get(virtualPath) !== content) {
            filesToInvalidate.push(virtualPath);
          }
        }

        files = newFiles;

        if (serverInstance) {
          for (const virtualPath of filesToInvalidate) {
            const resolvedId = `${resolvedPrefix}${virtualPath}`;
            const mod = serverInstance.moduleGraph.getModuleById(resolvedId);
            if (mod) {
              serverInstance.reloadModule(mod);
            }
          }
        } else {
          console.warn('Server instance not found, cannot invalidate files');
        }
      },
    },
  };
}

export function replaceFiles(plugin: VirtualFsPlugin, newFiles: Map<string, string>) {
  return plugin[API_PROPERTY].replaceFiles(newFiles);
}
