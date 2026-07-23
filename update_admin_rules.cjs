const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

const oldAdminMatch = `    match /Admin/{adminId} {
      // Only the authenticated admin can read their own document.
      allow read: if request.auth != null
                  && request.auth.uid == adminId;

      // Prevent creation, update and deletion from the client.
      allow create, update, delete: if false;
    }`;

const newAdminMatch = `    match /Admin/{adminId} {
      // An admin can read all admin docs, or a user can read their own admin doc
      allow read: if request.auth != null
                  && (request.auth.uid == adminId || isAdmin());

      // Admins can manage other admins
      allow create, update, delete: if isAdmin();
    }`;

rules = rules.replace(oldAdminMatch, newAdminMatch);

fs.writeFileSync('firestore.rules', rules);
