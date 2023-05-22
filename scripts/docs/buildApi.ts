import { buildComponentsReference } from './buildComponentsReference';
import { buildCoreReference } from './buildCoreReference';

async function main() {
  await buildComponentsReference();

  await buildCoreReference();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
