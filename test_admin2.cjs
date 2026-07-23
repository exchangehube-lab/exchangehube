const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
try {
  initializeApp();
  console.log("Admin initialized with default credentials!");
} catch (err) {
  console.log("Failed default init too.");
}
async function test() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('users').limit(1).get();
    console.log("Users found:", snapshot.size);
  } catch(e) {
    console.log("Firestore error:", e.message);
  }
}
test();
