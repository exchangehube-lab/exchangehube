require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC6k0lhOOY3cbeKQBp4i-FPpOOnlGC_62U",
  authDomain: "exchangehube-65d54.firebaseapp.com",
  projectId: "exchangehube-65d54"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(collection(db, 'personal_messages'), where('conversation_id', '==', 'test'), orderBy('created_at', 'asc'));
    await getDocs(q);
    console.log("Success!");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
