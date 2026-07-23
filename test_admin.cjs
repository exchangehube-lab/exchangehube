const admin = require('firebase-admin');
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Admin initialized with service account!");
} catch (e) {
  console.log("Error initializing admin:", e.message);
  try {
     admin.initializeApp();
     console.log("Admin initialized with default credentials!");
  } catch (err) {
     console.log("Failed default init too.");
  }
}
async function test() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('users').limit(1).get();
    console.log("Users found:", snapshot.size);
  } catch(e) {
    console.log("Firestore error:", e.message);
  }
}
test();
