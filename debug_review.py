import sys

with open('src/components/ReviewModal.tsx', 'r') as f:
    content = f.read()

import re

start_str = "const handleSubmit = async () => {"
end_str = "const handleToggleReaction"

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
      console.log("Debug: Starting writes");
      if (rating > 0) {
        console.log("Debug: writing rating");
        await setDoc(ratingRef, { rating, userId: uid, updatedAt: serverTimestamp() }, { merge: true });
      }
      if (reaction) {
        console.log("Debug: writing reaction");
        await setDoc(reactionRef, { reaction, userId: uid, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        console.log("Debug: deleting reaction");
        try { await deleteDoc(reactionRef); } catch(e) {}
      }
      if (comment.trim()) {
        console.log("Debug: writing comment");
        await setDoc(commentRef, {
          comment: comment.trim(),
          rating: rating,
          reaction: reaction,
          userId: uid,
          username: auth.currentUser.displayName || 'Unknown',
          userPhoto: auth.currentUser.photoURL || '',
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      console.log("Debug: writing bot stats");
      const botDoc = await getDoc(botRef);
      if (botDoc.exists()) {
        const botUpdates: any = {};
        if (rating > 0) {
          botUpdates.totalRatings = (botDoc.data().totalRatings || 0) + 1;
          botUpdates.averageRating = rating; // naive
        }
        if (Object.keys(botUpdates).length > 0) {
          await updateDoc(botRef, botUpdates);
        }
      }
      
      console.log("Debug: completed");
      onSuccess();
    } catch (err: any) {
      console.error("Debug Error:", err);
      alert("Debug error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  """
    content = content[:start_idx] + new_logic + content[end_idx:]
    with open('src/components/ReviewModal.tsx', 'w') as f:
        f.write(content)
    print("Patched ReviewModal.tsx for step-by-step debug")
else:
    print("Could not find boundaries")

