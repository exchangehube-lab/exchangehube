require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');
const { getFirestore, collection, query, where, getDocs, doc, setDoc } = require('firebase/firestore');

const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const firebaseConfig = {
  apiKey: "AIzaSyC6k0lhOOY3cbeKQBp4i-FPpOOnlGC_62U",
  authDomain: "exchangehube-65d54.firebaseapp.com",
  projectId: "exchangehube-65d54"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    const customToken = await admin.auth().createCustomToken("test_uid_123");
    await signInWithCustomToken(auth, customToken);
    console.log("Logged in!");
    
    try {
      const q = query(collection(db, 'personal_messages'), where('conversation_id', '==', 'test'));
      await getDocs(q);
      console.log("Success reading personal_messages!");
    } catch (e) {
      console.log("Failed reading personal_messages:", e.message);
    }

    try {
      await setDoc(doc(db, 'personal_messages', 'test_doc'), { test: 1 });
      console.log("Success writing personal_messages!");
    } catch (e) {
      console.log("Failed writing personal_messages:", e.message);
    }
  } catch (e) {
    console.error("Auth Error:", e.message);
  }
}
test();
