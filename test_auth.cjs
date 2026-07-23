require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const admin = require('firebase-admin');
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  // Create a custom token
  const customToken = await admin.auth().createCustomToken('test_uid');
  
  // Exchange for ID token using REST API (we need the web API key)
  // Let's just create an ID token if we can, or just try querying our proxy API?
  console.log("Custom Token generated");
}
test();
