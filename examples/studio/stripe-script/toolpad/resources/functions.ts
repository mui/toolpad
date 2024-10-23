import Stripe from 'stripe';
import archiver from 'archiver';

const initStripe = () => {
  if (!process.env.STRIPE_TOKEN) {
    throw new Error('Missing STRIPE_TOKEN environment variable');
  }
  return new Stripe(process.env.STRIPE_TOKEN, {
    apiVersion: '2023-08-16',
  });
};

export async function downloadPDFs(limit: number = 100, starting_after?: string) {
  const stripe = initStripe();

  const archive = archiver('zip', {
    zlib: { level: 9 }, // Compression level
  });

  const list = await stripe.invoices.list({
    limit,
    starting_after,
  });

  const pdfPromises = list.data?.map(async (invoice) => {
    try {
      if (invoice.invoice_pdf) {
        const response = await fetch(invoice.invoice_pdf);

        const pdfData = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfData);
        archive.append(pdfBuffer, { name: `invoice-${invoice.id}.pdf` });

        if (!response.ok) {
          throw new Error(`Failed to download PDF for invoice ${invoice.id}`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.all(pdfPromises);
  // Finalize the archive
  archive.finalize();
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => {
      const zipBuffer = Buffer.concat(chunks);

      const dataURL = `data:application/zip;base64,${zipBuffer.toString('base64')}`;
      resolve(dataURL);
    });

    archive.on('error', (error: Error) => {
      reject(error);
    });
  });
}
