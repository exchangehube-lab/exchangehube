const fs = require('fs');

let content = fs.readFileSync('src/AdminManagementPage.tsx', 'utf-8');

// Add initializeApp to firebase/app imports if needed, or import it
content = content.replace(
  "import { db, auth } from './firebase';",
  "import { db, auth, firebaseConfig } from './firebase';\nimport { initializeApp } from 'firebase/app';\nimport { getAuth as getSecondaryAuth } from 'firebase/auth';"
);

// Replace the handleCreateAdmin logic
const oldLogic = `    setIsAddingAdmin(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newAdminEmail, newAdminPassword);
      const newUid = userCredential.user.uid;

      await setDoc(doc(db, 'Admin', newUid), {`;

const newLogic = `    setIsAddingAdmin(true);
    try {
      // Use a secondary Firebase app to prevent the current admin from being signed out
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getSecondaryAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdminEmail, newAdminPassword);
      const newUid = userCredential.user.uid;
      
      // Sign out the secondary app's auth
      await secondaryAuth.signOut();

      await setDoc(doc(db, 'Admin', newUid), {`;

content = content.replace(oldLogic, newLogic);

// Remove the note about being logged out
const noteRegex = /<div className="mb-4 p-3 rounded-xl bg-amber-500\/10 border border-amber-500\/20 text-amber-400 text-xs">\s*Note: Creating a new admin may automatically sign you in as the new user in some browsers due to Firebase SDK behavior\. You may need to log back in as yourself afterward\.\s*<\/div>/g;
content = content.replace(noteRegex, '');

fs.writeFileSync('src/AdminManagementPage.tsx', content);
