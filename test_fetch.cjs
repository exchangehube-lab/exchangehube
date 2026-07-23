const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// generate a fake JWT
const jwt = require('jsonwebtoken');
const fakeToken = jwt.sign({ sub: '123' }, 'wrong_secret', { expiresIn: '1h' });

const customFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${fakeToken}`);
  return fetch(url, { ...options, headers });
};

const supabase = createClient(url, key, { global: { fetch: customFetch } });
supabase.from('personal_messages').select('*').limit(1).then(console.log);
