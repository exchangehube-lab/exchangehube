const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore(app);

module.exports = { app, db };
