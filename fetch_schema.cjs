const fs = require('fs');
require('dotenv').config({ path: '.env' });
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
  const json = await res.json();
  console.log(Object.keys(json));
  if (json.definitions) {
    console.log("Defs:", Object.keys(json.definitions));
    if (json.definitions.user_presence) console.log("user_presence:", json.definitions.user_presence);
    if (json.definitions.personal_messages) console.log("personal_messages:", json.definitions.personal_messages);
  }
}
run();
