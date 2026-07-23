const { createClient } = require('@supabase/supabase-js');

async function run() {
  // Let's use the actual URL/key from env
  require('dotenv').config();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("No supabase env vars");
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data, error } = await supabase.from('personal_messages').select('*').limit(1);
  console.log("Without token:");
  console.log("Error:", error);
  // console.log("Data:", data);
}
run();
