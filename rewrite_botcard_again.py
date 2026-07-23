import sys

with open('src/components/BotCard.tsx', 'r') as f:
    content = f.read()

# Replace imports
old_imports = """import React, { useState, useEffect } from 'react';
import { Cpu, User, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';"""

new_imports = """import React, { useState, useEffect } from 'react';
import { Cpu, User, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ReviewModal, ThankYouModal } from './ReviewModal';"""

if old_imports in content:
    content = content.replace(old_imports, new_imports)

# We need to replace the hook_code inside BotCard
target_hook = """  const [userRating, setUserRating] = useState<number>(0);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    if (!bot.id) return;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const ratingRef = doc(db, 'bots', bot.id, 'ratings', user.uid);
        const unsubRating = onSnapshot(ratingRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserRating(docSnap.data().rating);
          } else {
            setUserRating(0);
          }
        }, (error) => {
          console.warn("Could not fetch rating (check Firestore rules):", error.message);
        });

        const reactionRef = doc(db, 'bots', bot.id, 'reactions', user.uid);
        const unsubReaction = onSnapshot(reactionRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserReaction(docSnap.data().reaction);
          } else {
            setUserReaction(null);
          }
        }, (error) => {
          console.warn("Could not fetch reaction (check Firestore rules):", error.message);
        });

        return () => {
          unsubRating();
          unsubReaction();
        };
      } else {
        setUserRating(0);
        setUserReaction(null);
      }
    });
    return () => unsubscribeAuth();
  }, [bot.id]);"""

replacement_hook = """  const [userRating, setUserRating] = useState<number>(0);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  useEffect(() => {
    if (!bot.id) return;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const ratingRef = doc(db, 'bots', bot.id, 'ratings', user.uid);
        const unsubRating = onSnapshot(ratingRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserRating(docSnap.data().rating);
          } else {
            setUserRating(0);
          }
        }, (error) => {
          console.warn("Could not fetch rating (check Firestore rules):", error.message);
        });

        const reactionRef = doc(db, 'bots', bot.id, 'reactions', user.uid);
        const unsubReaction = onSnapshot(reactionRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserReaction(docSnap.data().reaction);
          } else {
            setUserReaction(null);
          }
        }, (error) => {
          console.warn("Could not fetch reaction (check Firestore rules):", error.message);
        });

        return () => {
          unsubRating();
          unsubReaction();
        };
      } else {
        setUserRating(0);
        setUserReaction(null);
      }
    });
    return () => unsubscribeAuth();
  }, [bot.id]);

  const handleOpenReview = () => {
    if (!auth.currentUser) return; // Optional: show login prompt
    setShowReviewModal(true);
  };"""

# Now we need to remove the handleRate and handleReaction functions
import re
content = re.sub(r'  const handleRate = async.*?};', '', content, flags=re.DOTALL)
content = re.sub(r'  const handleReaction = async.*?};', '', content, flags=re.DOTALL)

# And replace the target hook
content = content.replace(target_hook, replacement_hook)

# Finally replace onClick={() => handleRate(star)} with onClick={handleOpenReview}
content = content.replace('onClick={() => handleRate(star)}', 'onClick={handleOpenReview}')
content = content.replace("onClick={() => handleReaction('like')}", 'onClick={handleOpenReview}')
content = content.replace("onClick={() => handleReaction('dislike')}", 'onClick={handleOpenReview}')

# And add the modals at the end of the return statement
target_end = """      <div className="flex gap-3 relative z-10 mt-auto pt-5 border-t border-white/10">
        {actionButtons}
      </div>
    </div>
  );
}"""

replacement_end = """      <div className="flex gap-3 relative z-10 mt-auto pt-5 border-t border-white/10">
        {actionButtons}
      </div>
      
      {showReviewModal && (
        <ReviewModal 
          bot={bot} 
          onClose={() => setShowReviewModal(false)} 
          onSuccess={() => {
            setShowReviewModal(false);
            setShowThankYouModal(true);
          }} 
        />
      )}
      
      {showThankYouModal && (
        <ThankYouModal onClose={() => setShowThankYouModal(false)} />
      )}
    </div>
  );
}"""

content = content.replace(target_end, replacement_end)

with open('src/components/BotCard.tsx', 'w') as f:
    f.write(content)

print("Rewrote BotCard again successfully")
