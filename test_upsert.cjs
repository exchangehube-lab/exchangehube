require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function test() {
   let res = await supabase.from('user_presence').upsert({ user_id: '123', status: 'online' }, { onConflict: 'user_id' });
   console.log("upsert user_id:", res.error || res.data);
   
   let res2 = await supabase.from('user_presence').upsert({ uid: '123', status: 'online' }, { onConflict: 'uid' });
   console.log("upsert uid:", res2.error || res2.data);
}
test();
