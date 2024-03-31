import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const { PrismaClient } = require('../prisma/generated/client');

const INTERVAL = 1000;
const MAX_RETRIES = 30;

if (!process.env.TOOLPAD_DATABASE_URL) {
  throw new Error(`App started without config env variable TOOLPAD_DATABASE_URL`);
}

const prisma = new PrismaClient();

async function main() {
  for (let i = 1; i <= MAX_RETRIES; i += 1) {
    try {
      // eslint-disable-next-line no-console
      console.log(
        `(${i}/${MAX_RETRIES}) trying to connect db "${process.env.TOOLPAD_DATABASE_URL}"...`,
      );
      // eslint-disable-next-line no-await-in-loop
      await prisma.$connect();
      // eslint-disable-next-line no-console
      console.log(`connected!`);
      return;
    } catch (err: any) {
      if (err.errorCode === 'P1001') {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, INTERVAL);
        });
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to connect`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
