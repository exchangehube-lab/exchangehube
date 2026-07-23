import sys

with open('src/components/ReviewModal.tsx', 'r') as f:
    content = f.read()

import re

old_str = """      if (comment.trim()) {
        await setDoc(commentRef, {
          comment: comment.trim(),
          rating: rating,
          reaction: reaction,
          userId: uid,
          username: auth.currentUser.displayName || 'Unknown',
          userPhoto: auth.currentUser.photoURL || '',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      }"""

new_str = """      if (comment.trim()) {
        let currentUsername = auth.currentUser.displayName || 'Unknown';
        let currentUserPhoto = auth.currentUser.photoURL || '';
        try {
          const userProfileDoc = await getDoc(doc(db, 'users', uid));
          if (userProfileDoc.exists()) {
            currentUsername = userProfileDoc.data().username || userProfileDoc.data().fullName || currentUsername;
            currentUserPhoto = userProfileDoc.data().profilePhotoURL || currentUserPhoto;
          }
        } catch(e) {
          console.warn("Could not fetch user profile for review save", e);
        }

        await setDoc(commentRef, {
          comment: comment.trim(),
          rating: rating,
          reaction: reaction,
          userId: uid,
          username: currentUsername,
          userPhoto: currentUserPhoto,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      }"""

if old_str in content:
    content = content.replace(old_str, new_str)
    with open('src/components/ReviewModal.tsx', 'w') as f:
        f.write(content)
    print("Patched ReviewModal.tsx")
else:
    print("Could not find exact old_str string")
