const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

const oldUserRules = `    // User profiles
    match /users/{userId} {
      // Signed-in users can read profiles
      allow read: if request.auth != null;

      // User can create only their own profile
      allow create: if request.auth != null
                    && request.auth.uid == userId;

      // User can update only their own profile
      allow update: if request.auth != null
                    && request.auth.uid == userId;

      // No client-side deletion for now
      allow delete: if false;
    }`;

const newUserRules = `    // User profiles
    match /users/{userId} {
      // Signed-in users can read profiles
      allow read: if request.auth != null;

      // User can create only their own profile
      allow create: if request.auth != null
                    && request.auth.uid == userId;

      // User can update their own profile, or admins can update
      allow update: if request.auth != null
                    && (request.auth.uid == userId || isAdmin());

      // Admins can delete users
      allow delete: if isAdmin();
    }`;

rules = rules.replace(oldUserRules, newUserRules);
fs.writeFileSync('firestore.rules', rules);
