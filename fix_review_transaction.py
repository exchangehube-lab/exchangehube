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
      await runTransaction(db, async (transaction) => {
        const botDoc = await transaction.get(botRef);
        if (!botDoc.exists()) throw new Error("Bot does not exist.");
        
        let oldRatingDoc = null;
        if (rating > 0) {
          oldRatingDoc = await transaction.get(ratingRef);
        }
        
        const oldReactionDoc = await transaction.get(reactionRef);
        
        let botUpdates: any = {};
        
        if (rating > 0) {
          let newTotalRatings = botDoc.data().totalRatings || 0;
          let oldTotalPoints = (botDoc.data().averageRating || 0) * newTotalRatings;
          let newTotalPoints = oldTotalPoints;
          
          if (oldRatingDoc && oldRatingDoc.exists()) {
            const oldRating = oldRatingDoc.data().rating;
            newTotalPoints = oldTotalPoints - oldRating + rating;
            transaction.set(ratingRef, { rating, userId: uid, updatedAt: serverTimestamp() }, { merge: true });
          } else {
            newTotalRatings += 1;
            newTotalPoints = oldTotalPoints + rating;
            transaction.set(ratingRef, { rating, userId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
          }
          
          const newAverage = newTotalRatings > 0 ? newTotalPoints / newTotalRatings : 0;
          botUpdates.averageRating = newAverage;
          botUpdates.totalRatings = newTotalRatings;
        }
        
        if (reaction) {
          let newTotalLikes = botDoc.data().totalLikes || 0;
          let newTotalDislikes = botDoc.data().totalDislikes || 0;
          
          if (oldReactionDoc.exists()) {
            const oldReaction = oldReactionDoc.data().reaction;
            if (oldReaction !== reaction) {
              if (oldReaction === 'like') newTotalLikes = Math.max(0, newTotalLikes - 1);
              if (oldReaction === 'dislike') newTotalDislikes = Math.max(0, newTotalDislikes - 1);
              if (reaction === 'like') newTotalLikes += 1;
              if (reaction === 'dislike') newTotalDislikes += 1;
              transaction.set(reactionRef, { reaction, userId: uid, updatedAt: serverTimestamp() }, { merge: true });
            }
          } else {
            if (reaction === 'like') newTotalLikes += 1;
            if (reaction === 'dislike') newTotalDislikes += 1;
            transaction.set(reactionRef, { reaction, userId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
          }
          
          botUpdates.totalLikes = newTotalLikes;
          botUpdates.totalDislikes = newTotalDislikes;
        } else {
          if (oldReactionDoc.exists()) {
            const oldReaction = oldReactionDoc.data().reaction;
            let newTotalLikes = botDoc.data().totalLikes || 0;
            let newTotalDislikes = botDoc.data().totalDislikes || 0;
            if (oldReaction === 'like') newTotalLikes = Math.max(0, newTotalLikes - 1);
            if (oldReaction === 'dislike') newTotalDislikes = Math.max(0, newTotalDislikes - 1);
            transaction.delete(reactionRef);
            
            botUpdates.totalLikes = newTotalLikes;
            botUpdates.totalDislikes = newTotalDislikes;
          }
        }
        
        if (Object.keys(botUpdates).length > 0) {
          transaction.update(botRef, botUpdates);
        }
      });
      
      if (comment.trim()) {
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
      }
      
      onSuccess();
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert("Error submitting review. Note: if this persists, the database rules on your Firebase project may need to be updated manually in the Firebase Console. Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  """
    content = content[:start_idx] + new_logic + content[end_idx:]
    with open('src/components/ReviewModal.tsx', 'w') as f:
        f.write(content)
    print("Patched ReviewModal.tsx for final transaction logic")
else:
    print("Could not find boundaries")

