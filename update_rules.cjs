const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

const isAdminFunc = `
    function isAdmin() {
      return request.auth != null && exists(/databases/$(database)/documents/Admin/$(request.auth.uid)) && get(/databases/$(database)/documents/Admin/$(request.auth.uid)).data.role == 'admin';
    }
`;

const oldUsersMatch = `    match /users/{userId} {
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

const newUsersMatch = `    match /users/{userId} {
      // Signed-in users can read profiles
      allow read: if request.auth != null;

      // User can create only their own profile
      allow create: if request.auth != null
                    && request.auth.uid == userId;

      // User can update only their own profile, or admins can update any profile
      allow update: if request.auth != null
                    && (request.auth.uid == userId || isAdmin());

      // Admins can delete users
      allow delete: if isAdmin();
    }`;

rules = rules.replace("match /databases/{database}/documents {", "match /databases/{database}/documents {" + isAdminFunc);
rules = rules.replace(oldUsersMatch, newUsersMatch);

fs.writeFileSync('firestore.rules', rules);
