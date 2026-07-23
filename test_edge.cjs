const fetch = require('node-fetch');
async function check(name) {
  const res = await fetch(`https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/${name}`);
  console.log(`${name}: ${res.status}`);
}
async function test() {
  await check('get-messages');
  await check('read-messages');
  await check('messages');
  await check('fetch-messages');
  await check('get-presence');
}
test();
