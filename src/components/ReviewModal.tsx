import React, { useState, useEffect } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, Cpu, CheckCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';

interface ReviewModalProps {
  bot: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ bot, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExistingData = async () => {
      if (!auth.currentUser || !bot?.id) return;
      const uid = auth.currentUser.uid;
      
      try {
        const ratingDoc = await getDoc(doc(db, 'bots', bot.id, 'ratings', uid));
        if (ratingDoc.exists()) setRating(ratingDoc.data().rating);
        
        const reactionDoc = await getDoc(doc(db, 'bots', bot.id, 'reactions', uid));
        if (reactionDoc.exists()) setReaction(reactionDoc.data().reaction);
        
        const commentDoc = await getDoc(doc(db, 'bots', bot.id, 'comments', uid));
        if (commentDoc.exists()) setComment(commentDoc.data().comment || '');
      } catch (err) {
        console.warn("Could not fetch previous review data", err);
      }
    };
    fetchExistingData();
  }, [bot]);

          const handleSubmit = async () => {
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
        let currentUsername = auth.currentUser.displayName || "Anonymous User";
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
      }
      
      onSuccess();
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert("Error submitting review. Note: if this persists, the database rules on your Firebase project may need to be updated manually in the Firebase Console. Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReaction = (type: 'like' | 'dislike') => {
    setReaction(prev => prev === type ? null : type);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl w-full max-w-md shadow-[0_15px_40px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in-95 duration-200 flex flex-col p-8">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#1a2342] border border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            {bot?.botImageURL ? (
              <img src={bot.botImageURL} alt={bot.botName} className="w-full h-full object-cover" />
            ) : (
              <Cpu className="w-10 h-10 text-purple-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">{bot?.botName}</h2>
          <p className="text-sm text-[#8F9BB3]">Rate and review this bot</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button type="button"
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 p-1"
              >
                <Star 
                  className={`w-8 h-8 transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-[#475569] hover:text-[#64748b]'}`} 
                />
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button type="button"
              onClick={() => handleToggleReaction('like')}
              className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border transition-all ${reaction === 'like' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-[#8F9BB3] hover:bg-white/10'}`}
            >
              <ThumbsUp className={`w-5 h-5 ${reaction === 'like' ? 'fill-blue-400 text-blue-400' : ''}`} />
              <span className="font-medium">Like</span>
            </button>
            <button type="button"
              onClick={() => handleToggleReaction('dislike')}
              className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border transition-all ${reaction === 'dislike' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-[#8F9BB3] hover:bg-white/10'}`}
            >
              <ThumbsDown className={`w-5 h-5 ${reaction === 'dislike' ? 'fill-red-400 text-red-400' : ''}`} />
              <span className="font-medium">Dislike</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#B8C0D0]">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this bot (Optional)"
              className="w-full h-24 bg-[#1a2342] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#475569] focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </div>

      </div>
    </div>
  );
}

export function ThankYouModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl w-full max-w-sm shadow-[0_15px_40px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in-95 duration-200 flex flex-col p-8 items-center text-center">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="text-6xl mb-4 mt-2">🙂</div>
        <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
        <p className="text-[#B8C0D0] mb-8">Your feedback has been submitted successfully.</p>
        
        <button 
          type="button"
          onClick={onClose}
          className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
