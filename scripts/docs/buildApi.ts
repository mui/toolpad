import { buildComponentsReference } from './buildComponentsReference';

async function main() {
  await buildComponentsReference();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
