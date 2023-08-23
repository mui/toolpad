import * as fs from 'fs/promises';
import { Options } from 'tsup';
import { exec } from 'child_process';
import { promisify } from 'util';

const execP = promisify(exec);

type EsbuildPlugin = NonNullable<Options['esbuildPlugins']>[number];

export function cleanFolderOnFailure(folder: string): EsbuildPlugin {
  return {
    name: 'clean-dist-on-failure',
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length > 0) {
          await fs.rm(folder, { recursive: true, force: true });
        }
      });
    },
  };
}

export async function generateTypes(tsconfig: string = './tsconfig.json') {
  // eslint-disable-next-line no-console
  console.log(`generating types with "${tsconfig}"`);
  await execP(`tsc --emitDeclarationOnly --declaration -p ${tsconfig}`);
  // eslint-disable-next-line no-console
  console.log(`types generated`);
}
