import invariant from 'invariant';
import { buildApp } from './toolpadAppBuilder';
import { initProject } from './localMode';

async function main() {
  invariant(
    process.env.NODE_ENV === 'production',
    'The app builder must be run with NODE_ENV=production',
  );
  invariant(!!process.env.TOOLPAD_PROJECT_DIR, 'A project root must be defined');
  invariant(!!process.env.TOOLPAD_BASE, 'A base path must be defined');

  const base = process.env.TOOLPAD_BASE;

  const project = await initProject({
    dev: false,
    dir: process.env.TOOLPAD_PROJECT_DIR,
    base,
  });

  await project.build();

  await buildApp({
    root: project.getRoot(),
    base,
    getComponents: () => project.getComponentsManifest(),
    getPagesManifest: () => project.getPagesManifest(),
    outDir: project.getAppOutputFolder(),
    loadDom: () => project.loadDom(),
  });

  await project.writeBuildInfo();

  await project.dispose();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
