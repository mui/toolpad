import invariant from 'invariant';
import { buildApp } from '../src/server/toolpadAppBuilder';
import { initProject } from '../src/server/localMode';

async function main() {
  invariant(
    process.env.NODE_ENV === 'production',
    'The app builder must be run with NODE_ENV=production',
  );
  invariant(!!process.env.TOOLPAD_PROJECT_DIR, 'A project root must be defined');

  const projectDir = process.env.TOOLPAD_PROJECT_DIR;

  const project = await initProject({ dev: false, dir: projectDir });

  await project.build();

  await buildApp({
    root: projectDir,
    base: '/prod',
    getComponents: () => project.getComponents(),
    outDir: project.getAppOutputFolder(),
  });

  await project.dispose();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
