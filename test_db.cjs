const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.log("No url or key");
  process.exit(1);
}
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('user_presence').select('*').limit(1);
  console.log("user_presence:", data, error);
}
run();
