require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { createClient } = require('@supabase/supabase-js');

const firebaseConfig = {
  apiKey: "AIzaSyC6k0lhOOY3cbeKQBp4i-FPpOOnlGC_62U",
  authDomain: "exchangehube-65d54.firebaseapp.com",
  projectId: "exchangehube-65d54"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function test() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, "testuser_" + Date.now() + "@example.com", "password123");
    const token = await cred.user.getIdToken();
    console.log("Got real Firebase JWT!");
    
    const customFetch = async (url, options = {}) => {
      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      return fetch(url, { ...options, headers });
    };

    const supabase = createClient(url, key, { global: { fetch: customFetch } });
    let res = await supabase.from('user_presence').select('*').limit(1);
    console.log("Supabase response:", res.error || res.data);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
