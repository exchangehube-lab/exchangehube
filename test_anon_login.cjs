require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.auth.signInAnonymously();
  console.log("anon login:", error || data);
}
test();
