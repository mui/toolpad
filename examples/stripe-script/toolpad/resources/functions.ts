import fs from 'fs';
import { exec } from 'child_process';
import Stripe from 'stripe';
import path from 'path';

const initStripe = () => {
  if (!process.env.STRIPE_TOKEN) {
    throw new Error('Missing STRIPE_TOKEN environment variable');
  }
  return new Stripe(process.env.STRIPE_TOKEN, {
    apiVersion: '2022-11-15',
  });
};

// const stripe = new Stripe(process.env.STRIPE_TOKEN, {
//   apiVersion: '2022-11-15',
// });

export async function listInvoices(limit: number = 100, starting_after?: string) {
  const stripe = initStripe();
  const list = await stripe.invoices.list({
    limit,
    starting_after,
  });
  return JSON.stringify(list.data);
}

export async function downloadPDFs(limit: number = 100, starting_after?: string) {
  const stripe = initStripe();

  const list = await stripe.invoices.list({
    starting_after,
    limit,
  });

  list.data?.forEach((invoice) => {
    try {
      const dest = path.resolve('.', `invoices-${invoice.id}.pdf`);
      // check if destination is resolvable
      if (fs.existsSync(dest)) {
        console.error('Invoice already exists:', dest);
        return;
      }
      exec(`curl '${invoice.invoice_pdf}' -L -o '${dest}'`);
    } catch (e) {
      console.error(e.stack);
      console.error('Failed to process invoice id:', invoice.id);
      throw e;
    }
  });
}
