import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlhkchzecwkyfcvxmwmb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey ?? '');

export default async function handler() {
  const { data } = await supabase.from('product_data').select('*');
  return data;
}
