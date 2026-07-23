import sys

with open('src/components/ReviewModal.tsx', 'r') as f:
    content = f.read()

target = """      if (comment.trim()) {
        await setDoc(commentRef, {
          comment: comment.trim(),
          userId: uid,
          username: auth.currentUser.displayName || 'Unknown',
          userPhoto: auth.currentUser.photoURL || '',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp() // setDoc with merge will keep this if we use merge properly, but let's just do normal setDoc with merge: true, wait, we can't do serverTimestamp for createdAt if it already exists, so maybe:
        }, { merge: true });
      } else {"""

replacement = """      if (comment.trim()) {
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
      } else {"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/ReviewModal.tsx', 'w') as f:
        f.write(content)
    print("Updated ReviewModal successfully")
else:
    print("ReviewModal target not found")
