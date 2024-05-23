import { buildStudioComponentsReference } from './buildStudioComponentsReference';

async function main() {
  await buildStudioComponentsReference();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
