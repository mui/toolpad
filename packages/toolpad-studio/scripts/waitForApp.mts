import arg from 'arg';

const DEFAULT_URL = 'http://localhost:3000/';

const args = arg({
  '--url': String,
});

const INTERVAL = 1000;
const MAX_RETRIES = 30;

const HEALTH_CHECK_URL = `/health-check`;

async function main() {
  const checkedUrl = new URL(HEALTH_CHECK_URL, args['--url'] || DEFAULT_URL);
  for (let i = 1; i <= MAX_RETRIES; i += 1) {
    try {
      // eslint-disable-next-line no-console
      console.log(`(${i}/${MAX_RETRIES}) trying reach "${checkedUrl.href}"...`);
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(checkedUrl.href);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // eslint-disable-next-line no-console
      console.log(`connected!`);
      return;
    } catch (err: any) {
      console.error(` > ${err.message}`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, INTERVAL);
      });
    }
  }
  throw new Error(`Failed to connect`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
