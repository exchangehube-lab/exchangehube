require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

fetch(`${url}/rest/v1/?apikey=${key}`)
  .then(res => res.json())
  .then(json => {
    if (json.definitions) {
       console.log("Tables:", Object.keys(json.definitions));
    } else {
       console.log("No definitions found", json);
    }
  });
