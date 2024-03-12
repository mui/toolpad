import { posix as path } from 'path';
import { Plugin, ViteDevServer, transformWithEsbuild } from 'vite';

const API_PROPERTY = Symbol('virtual-fs-api');

interface VirtualFsPluginApi {
  replaceFiles: (newFiles: Map<string, LoadResult>) => void;
}

export type VirtualFsPlugin = Plugin & { [API_PROPERTY]: VirtualFsPluginApi };

export type LoadResult = Awaited<ReturnType<Extract<NonNullable<Plugin['load']>, Function>>>;

export type VirtualFileContent = LoadResult;

export default function virtualFsPlugin(
  initialFiles: Map<string, VirtualFileContent>,
  userIdentifier: string,
): VirtualFsPlugin {
  const prefix = `virtual:${userIdentifier}:`;
  const resolvedPrefix = `\0${prefix}`;
  const transformExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
  const resolveExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.json']);
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

        for (const extension of resolveExtensions) {
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
        return content;
      }
      return null;
    },

    async transform(code, id) {
      if (id.startsWith(resolvedPrefix)) {
        const virtualPath = id.slice(resolvedPrefix.length);
        if (transformExtensions.has(path.extname(virtualPath))) {
          return transformWithEsbuild(code, virtualPath);
        }
      }
      return null;
    },

    [API_PROPERTY]: {
      async replaceFiles(newFiles: Map<string, LoadResult>) {
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

export function replaceFiles(plugin: VirtualFsPlugin, newFiles: Map<string, LoadResult>) {
  return plugin[API_PROPERTY].replaceFiles(newFiles);
}
