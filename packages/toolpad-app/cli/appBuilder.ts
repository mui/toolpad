import invariant from 'invariant';
import { buildApp } from '../src/server/toolpadAppBuilder';
import { buildProject } from '../src/server/localMode';

async function main() {
  invariant(
    process.env.NODE_ENV === 'production',
    'The app builder must be run with NODE_ENV=production',
  );
  invariant(!!process.env.TOOLPAD_PROJECT_DIR, 'A project root must be defined');

  const projectDir = process.env.TOOLPAD_PROJECT_DIR;

  await buildProject(projectDir);

  await buildApp({ root: projectDir, base: '/prod' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
