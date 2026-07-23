import sys

with open('src/components/BotCard.tsx', 'r') as f:
    content = f.read()

# We need to replace the imports to include useState, useEffect, ThumbsUp, ThumbsDown, Star, auth, db, doc, onSnapshot, runTransaction, serverTimestamp
new_imports = """import React, { useState, useEffect } from 'react';
import { Cpu, User, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
"""

content = content.replace("import React from 'react';\nimport { Cpu, User } from 'lucide-react';", new_imports)

# Now we need to add the state and useEffect to BotCard
hook_code = """
  const [userRating, setUserRating] = useState<number>(0);
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
        });

        const reactionRef = doc(db, 'bots', bot.id, 'reactions', user.uid);
        const unsubReaction = onSnapshot(reactionRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserReaction(docSnap.data().reaction);
          } else {
            setUserReaction(null);
          }
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

  const handleRate = async (newRating: number) => {
    if (!auth.currentUser) return;
    const botRef = doc(db, 'bots', bot.id);
    const ratingRef = doc(db, 'bots', bot.id, 'ratings', auth.currentUser.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const botDoc = await transaction.get(botRef);
        if (!botDoc.exists()) throw new Error("Bot doesn't exist");
        const ratingDoc = await transaction.get(ratingRef);

        let newTotalRatings = botDoc.data().totalRatings || 0;
        let oldTotalPoints = (botDoc.data().averageRating || 0) * newTotalRatings;
        let newTotalPoints = oldTotalPoints;

        if (ratingDoc.exists()) {
          const oldRating = ratingDoc.data().rating;
          newTotalPoints = oldTotalPoints - oldRating + newRating;
        } else {
          newTotalRatings += 1;
          newTotalPoints = oldTotalPoints + newRating;
        }

        const newAverage = newTotalRatings > 0 ? newTotalPoints / newTotalRatings : 0;

        transaction.set(ratingRef, {
          rating: newRating,
          updatedAt: serverTimestamp(),
          ...(ratingDoc.exists() ? {} : { createdAt: serverTimestamp() })
        }, { merge: true });

        transaction.update(botRef, {
          averageRating: newAverage,
          totalRatings: newTotalRatings
        });
      });
    } catch (e) {
      console.error('Error rating bot:', e);
    }
  };

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (!auth.currentUser) return;
    const botRef = doc(db, 'bots', bot.id);
    const reactionRef = doc(db, 'bots', bot.id, 'reactions', auth.currentUser.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const botDoc = await transaction.get(botRef);
        if (!botDoc.exists()) throw new Error("Bot doesn't exist");
        const reactionDoc = await transaction.get(reactionRef);

        let newTotalLikes = botDoc.data().totalLikes || 0;
        let newTotalDislikes = botDoc.data().totalDislikes || 0;

        if (reactionDoc.exists()) {
          const oldReaction = reactionDoc.data().reaction;
          if (oldReaction === reactionType) {
            if (oldReaction === 'like') newTotalLikes = Math.max(0, newTotalLikes - 1);
            if (oldReaction === 'dislike') newTotalDislikes = Math.max(0, newTotalDislikes - 1);
            transaction.delete(reactionRef);
          } else {
            if (oldReaction === 'like') newTotalLikes = Math.max(0, newTotalLikes - 1);
            if (oldReaction === 'dislike') newTotalDislikes = Math.max(0, newTotalDislikes - 1);
            
            if (reactionType === 'like') newTotalLikes += 1;
            if (reactionType === 'dislike') newTotalDislikes += 1;
            
            transaction.set(reactionRef, {
              reaction: reactionType,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        } else {
          if (reactionType === 'like') newTotalLikes += 1;
          if (reactionType === 'dislike') newTotalDislikes += 1;

          transaction.set(reactionRef, {
            reaction: reactionType,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        transaction.update(botRef, {
          totalLikes: newTotalLikes,
          totalDislikes: newTotalDislikes
        });
      });
    } catch (e) {
      console.error('Error reacting to bot:', e);
    }
  };
"""

target_component_start = "export function BotCard({ bot, actionButtons }: BotCardProps) {\n  return ("
replacement_component_start = f"export function BotCard({{ bot, actionButtons }}: BotCardProps) {{{hook_code}\n  return ("

content = content.replace(target_component_start, replacement_component_start)

target_desc = """        <h3 className="text-xl font-bold text-white text-center mb-2">{bot.botName}</h3>
        {bot.description && (
          <p className="text-sm text-[#B8C0D0] text-center line-clamp-2 w-full">
            {bot.description}
          </p>
        )}
      </div>"""

replacement_desc = """        <h3 className="text-xl font-bold text-white text-center mb-2">{bot.botName}</h3>
        {bot.description && (
          <p className="text-sm text-[#B8C0D0] text-center line-clamp-2 w-full mb-3">
            {bot.description}
          </p>
        )}
        
        <div className="flex flex-col items-center gap-3 w-full mt-2">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = Math.round(bot.averageRating || 0) >= star;
                const isUserRated = userRating >= star;
                return (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="focus:outline-none transition-transform hover:scale-125 p-0.5"
                  >
                    <Star 
                      className={`w-4 h-4 transition-colors ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-[#475569]'} hover:fill-yellow-300 hover:text-yellow-300`} 
                    />
                  </button>
                )
              })}
            </div>
            <span className="text-white font-medium text-sm">
              {(bot.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-[#8F9BB3] text-xs">
              ({bot.totalRatings || 0} Ratings)
            </span>
          </div>
          
          <div className="flex items-center gap-6 mt-1">
            <button 
              onClick={() => handleReaction('like')}
              className={`flex items-center gap-2 transition-colors ${userReaction === 'like' ? 'text-blue-400' : 'text-[#8F9BB3] hover:text-white'}`}
            >
              <ThumbsUp className={`w-4 h-4 ${userReaction === 'like' ? 'fill-blue-400 text-blue-400' : ''}`} />
              <span className="text-sm font-medium">{bot.totalLikes || 0}</span>
            </button>
            <button 
              onClick={() => handleReaction('dislike')}
              className={`flex items-center gap-2 transition-colors ${userReaction === 'dislike' ? 'text-red-400' : 'text-[#8F9BB3] hover:text-white'}`}
            >
              <ThumbsDown className={`w-4 h-4 ${userReaction === 'dislike' ? 'fill-red-400 text-red-400' : ''}`} />
              <span className="text-sm font-medium">{bot.totalDislikes || 0}</span>
            </button>
          </div>
        </div>
      </div>"""

content = content.replace(target_desc, replacement_desc)

with open('src/components/BotCard.tsx', 'w') as f:
    f.write(content)

print("Rewrote BotCard.tsx successfully")
