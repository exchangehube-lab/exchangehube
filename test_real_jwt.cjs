require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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
    const cred = await signInWithEmailAndPassword(auth, "ffack266@gmail.com", "password123"); // I will need to know a user's password, maybe I can just create one?
    const token = await cred.user.getIdToken();
    console.log("Got token:", token.substring(0, 15) + "...");
    
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
