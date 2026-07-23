require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function test() {
   let res = await supabase.from('personal_messages').select('*').limit(1);
   console.log("personal_messages:", res.error || res.data);
   
   res = await supabase.from('channel_messages').select('*').limit(1);
   console.log("channel_messages:", res.error || res.data);

   res = await supabase.from('user_presence').select('*').limit(1);
   console.log("user_presence:", res.error || res.data);
}
test();
