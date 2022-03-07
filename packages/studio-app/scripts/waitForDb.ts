import { PrismaClient } from '../prisma/generated/client';

const INTERVAL = 1000;
const MAX_RETRIES = 30;

if (!process.env.STUDIO_DATABASE_URL) {
  throw new Error(`App started without config env variable STUDIO_DATABASE_URL`);
}

const prisma = new PrismaClient();

async function main() {
  for (let i = 1; i <= MAX_RETRIES; i += 1) {
    try {
      console.log(`(${i}/${MAX_RETRIES}) trying to connect db...`);
      // eslint-disable-next-line no-await-in-loop
      await prisma.$connect();
      console.log(`connected!`);
      return;
    } catch (err) {
      if (err.errorCode === 'P1001') {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, INTERVAL));
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to connect`);
}

main().catch(() => process.exit(1));
