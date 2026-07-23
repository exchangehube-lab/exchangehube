import sys

with open('src/components/ReviewModal.tsx', 'r') as f:
    content = f.read()

import re

# We will replace the entire runTransaction block with simple setDoc calls.
start_str = "await runTransaction(db, async (transaction) => {"
end_str = "      // Handle Comment (outside transaction because we can just set it)"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_logic = """
      if (rating > 0) {
        await setDoc(ratingRef, { rating, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
      }
      
      if (reaction) {
        await setDoc(reactionRef, { reaction, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
      } else {
        await deleteDoc(reactionRef);
      }
"""
    content = content[:start_idx-6] + new_logic + content[end_idx:]
    with open('src/components/ReviewModal.tsx', 'w') as f:
        f.write(content)
    print("Replaced runTransaction with simple setDocs")
else:
    print("Could not find boundaries")

