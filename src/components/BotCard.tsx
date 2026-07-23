import React, { useState, useEffect } from 'react';
import { Cpu, User, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, collection } from "firebase/firestore";
import { PublisherInfo } from './PublisherInfo';
import { ReviewModal, ThankYouModal } from './ReviewModal';


interface BotCardProps {
  bot: any;
  key?: string | number;
  actionButtons: React.ReactNode;
}

export function BotCard({ bot, actionButtons }: BotCardProps) {
  const [userRating, setUserRating] = useState<number>(0);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [liveAverageRating, setLiveAverageRating] = useState<number>(bot.averageRating || 0);
  const [liveTotalRatings, setLiveTotalRatings] = useState<number>(bot.totalRatings || 0);
  const [liveTotalLikes, setLiveTotalLikes] = useState<number>(bot.totalLikes || 0);
  const [liveTotalDislikes, setLiveTotalDislikes] = useState<number>(bot.totalDislikes || 0);


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
    return () => {
      unsubscribeAuth();
      
      
    };
  }, [bot.id]);

  const handleOpenReview = () => {
    if (!auth.currentUser) return; // Optional: show login prompt
    setShowReviewModal(true);
  };





  return (
    <div className="bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 relative group overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(168,85,247,0.1)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.2)] hover:scale-[1.02] hover:bg-[#1d2958]/90 flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      
      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1a2342] border border-white/10 flex items-center justify-center overflow-hidden mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          {bot.botImageURL ? (
            <img src={bot.botImageURL} alt={bot.botName} className="w-full h-full object-cover" />
          ) : (
            <Cpu className="w-10 h-10 text-purple-400" />
          )}
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">{bot.botName}</h3>
        {bot.description && (
          <p className="text-sm text-[#B8C0D0] text-center line-clamp-2 w-full mb-3">
            {bot.description}
          </p>
        )}
        
        <div className="flex flex-col items-center gap-3 w-full mt-2">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = Math.round(liveAverageRating) >= star;
                const isUserRated = userRating >= star;
                return (
                  <button
                    key={star}
                    onClick={handleOpenReview}
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
              {liveAverageRating.toFixed(1)}
            </span>
            <span className="text-[#8F9BB3] text-xs">
              ({liveTotalRatings} Ratings)
            </span>
          </div>
          
          <div className="flex items-center gap-6 mt-1">
            <button 
              onClick={handleOpenReview}
              className={`flex items-center gap-2 transition-colors ${userReaction === 'like' ? 'text-blue-400' : 'text-[#8F9BB3] hover:text-white'}`}
            >
              <ThumbsUp className={`w-4 h-4 ${userReaction === 'like' ? 'fill-blue-400 text-blue-400' : ''}`} />
              <span className="text-sm font-medium">{liveTotalLikes}</span>
            </button>
            <button 
              onClick={handleOpenReview}
              className={`flex items-center gap-2 transition-colors ${userReaction === 'dislike' ? 'text-red-400' : 'text-[#8F9BB3] hover:text-white'}`}
            >
              <ThumbsDown className={`w-4 h-4 ${userReaction === 'dislike' ? 'fill-red-400 text-red-400' : ''}`} />
              <span className="text-sm font-medium">{liveTotalDislikes}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 text-sm flex-1 relative z-10 bg-black/20 p-5 rounded-2xl border border-white/5">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-[#8F9BB3] uppercase tracking-wider mb-1.5 font-medium">Mine</span>
          <span className="font-semibold text-white">{bot.category || '-'}</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-[#8F9BB3] uppercase tracking-wider mb-1.5 font-medium">Mining Type</span>
          <span className="font-semibold text-white">{bot.accessType || '-'}</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-[#8F9BB3] uppercase tracking-wider mb-1.5 font-medium">Currency</span>
          <span className="font-semibold text-white">{bot.botCurrency || '-'}</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-[#8F9BB3] uppercase tracking-wider mb-1.5 font-medium">Post</span>
          <span className="font-semibold text-white">{bot.createdAt?.toDate ? bot.createdAt.toDate().toLocaleDateString() : 'Unknown'}</span>
        </div>
      </div>

      <div className="mb-8 relative z-10">
        <PublisherInfo ownerUid={bot.ownerUid} initialUsername={bot.ownerUsername} initialProfilePicture={bot.ownerProfilePicture} />
      </div>

      <div className="flex gap-3 relative z-10 mt-auto pt-5 border-t border-white/10">
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
}
