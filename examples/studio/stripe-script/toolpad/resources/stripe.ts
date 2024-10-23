/**
 * Toolpad Studio data provider file.
 * See: https://mui.com/toolpad/studio/concepts/data-providers/
 */

import Stripe from 'stripe';
import { createDataProvider } from '@toolpad/studio/server';

const initStripe = () => {
  if (!process.env.STRIPE_TOKEN) {
    throw new Error('Missing STRIPE_TOKEN environment variable');
  }
  return new Stripe(process.env.STRIPE_TOKEN, {
    apiVersion: '2023-10-16',
  });
};

export default createDataProvider({
  paginationMode: 'cursor',
  async getRecords({ paginationModel: { cursor, pageSize } }) {
    const stripe = initStripe();
    const list = await stripe.invoices.list({
      limit: pageSize,
      starting_after: cursor ?? undefined,
    });

    return {
      records: list.data ?? [],
      cursor: list.data?.[list.data.length - 1].id ?? null,
    };
  },
});
