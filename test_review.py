import sys

with open('src/components/ReviewModal.tsx', 'r') as f:
    content = f.read()

import re

# Find handleSubmit function
start_str = "const handleSubmit = async () => {"
end_str = "const handleToggleReaction ="

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_logic = """  const handleSubmit = async () => {
    if (!auth.currentUser || !bot?.id) return;
    if (rating === 0 && !reaction && !comment.trim()) {
      alert("Please provide a rating, reaction, or comment before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    const uid = auth.currentUser.uid;
    const botRef = doc(db, 'bots', bot.id);
    const ratingRef = doc(db, 'bots', bot.id, 'ratings', uid);
    const reactionRef = doc(db, 'bots', bot.id, 'reactions', uid);
    const commentRef = doc(db, 'bots', bot.id, 'comments', uid);
    
    try {
      if (rating > 0) {
        try {
          await setDoc(ratingRef, { rating, userId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
        } catch(e) { throw new Error("Failed at ratingRef: " + e.message); }
      }
      if (reaction) {
        try {
          await setDoc(reactionRef, { reaction, userId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
        } catch(e) { throw new Error("Failed at reactionRef: " + e.message); }
      } else {
        try {
          await deleteDoc(reactionRef);
        } catch(e) {}
      }
      if (comment.trim()) {
        try {
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
        } catch(e) { throw new Error("Failed at commentRef: " + e.message); }
      }
      
      try {
        const botDoc = await getDoc(botRef);
        let botUpdates: any = {};
        if (rating > 0) {
            botUpdates.averageRating = botDoc.data()?.averageRating || rating; // just dummy
            botUpdates.totalRatings = (botDoc.data()?.totalRatings || 0) + 1;
        }
        if (Object.keys(botUpdates).length > 0) {
           await updateDoc(botRef, botUpdates);
        }
      } catch(e) { throw new Error("Failed at botRef update: " + e.message); }
      
      onSuccess();
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert("Debug error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  """
    content = content[:start_idx] + new_logic + content[end_idx:]
    with open('src/components/ReviewModal.tsx', 'w') as f:
        f.write(content)
    print("Patched ReviewModal.tsx for debugging")
else:
    print("Could not find boundaries")

