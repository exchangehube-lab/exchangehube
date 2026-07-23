require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, query, where, orderBy, getDocs } = require('firebase/firestore');

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
    await signInWithEmailAndPassword(auth, "ffack266@gmail.com", "password123");
    console.log("Logged in!");
    const q = query(collection(db, 'personal_messages'), where('conversation_id', '==', 'test'));
    await getDocs(q);
    console.log("Success reading personal_messages!");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
