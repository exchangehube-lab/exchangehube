require('dotenv').config({ path: '.env' });
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function check(col) {
  const res = await fetch(`${url}/rest/v1/typing_status?select=${col}&limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(col, res.status, await res.text());
}

async function run() {
  await check('user_id');
  await check('uid');
  await check('chat_id');
  await check('conversation_id');
  await check('channel_id');
}
run();
