import { PublisherInfo } from './components/PublisherInfo';
import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Cpu, User, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy, doc } from 'firebase/firestore';


function ReviewItem({ review }: { review: any; key?: string | number }) {
  const [liveUsername, setLiveUsername] = React.useState<string>(review.username && review.username !== 'Unknown' ? review.username : 'Anonymous User');
  const [liveUserPhoto, setLiveUserPhoto] = React.useState<string>(review.userPhoto || '');

  React.useEffect(() => {
    if (!review.userId) return;
    const unsub = onSnapshot(doc(db, 'users', review.userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveUsername(data.username || data.fullName || 'Anonymous User');
        setLiveUserPhoto(data.profilePhotoURL || '');
      }
    });
    return () => unsub();
  }, [review.userId]);

  return (
    <div className="bg-black/20 border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
          {liveUserPhoto ? (
            <img src={liveUserPhoto} alt={liveUsername} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-white truncate">{liveUsername}</span>
          <span className="text-xs text-[#8F9BB3]">
            {review.updatedAt?.toDate ? review.updatedAt.toDate().toLocaleDateString() : 'Unknown date'}
          </span>
        </div>
      </div>
      
      {(review.rating > 0 || review.reaction) && (
        <div className="flex items-center gap-3">
          {review.rating > 0 && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`w-3.5 h-3.5 ${review.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-600'}`} 
                />
              ))}
            </div>
          )}
          {review.reaction === 'like' && (
            <ThumbsUp className="w-4 h-4 fill-blue-400 text-blue-400" />
          )}
          {review.reaction === 'dislike' && (
            <ThumbsDown className="w-4 h-4 fill-red-400 text-red-400" />
          )}
        </div>
      )}
      
      {review.comment && (
        <p className="text-sm text-[#B8C0D0] leading-relaxed break-words whitespace-pre-wrap">
          {review.comment}
        </p>
      )}
    </div>
  );
}

export function BotViewModal({ bot, onClose }: { bot: any, onClose: () => void }) {
    const [reviews, setReviews] = useState<any[]>([]);
  const [liveAverageRating, setLiveAverageRating] = useState<number>(bot.averageRating || 0);
  const [liveTotalRatings, setLiveTotalRatings] = useState<number>(bot.totalRatings || 0);
  const [liveTotalLikes, setLiveTotalLikes] = useState<number>(bot.totalLikes || 0);
  const [liveTotalDislikes, setLiveTotalDislikes] = useState<number>(bot.totalDislikes || 0);


  useEffect(() => {
    if (!bot?.id) return;
    // Real-time aggregate listeners
    
      

    
      

    const q = query(collection(db, 'bots', bot.id, 'comments'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const revs: any[] = [];
      snapshot.forEach((doc) => {
        revs.push({ id: doc.id, ...doc.data() });
      });
      setReviews(revs);
    }, (error) => {
      console.warn("Could not fetch reviews:", error.message);
    });
    return () => {
      unsubscribe();
      
      
    };
  }, [bot?.id]);

  if (!bot) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl w-full max-w-4xl shadow-[0_15px_40px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
          <h3 className="text-xl font-bold text-white tracking-tight">Bot Details</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">
          
          {/* Left Column: Bot Info */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 mx-auto md:mx-0 shadow-2xl">
                {bot.botImageURL ? (
                  <img src={bot.botImageURL} alt={bot.botName} className="w-full h-full object-cover" />
                ) : (
                  <Cpu className="w-16 h-16 text-purple-400" />
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{bot.botName}</h2>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-bold text-lg">{liveAverageRating.toFixed(1)}</span>
                    <span className="text-[#8F9BB3] text-sm">({liveTotalRatings} Ratings)</span>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <ThumbsUp className="w-4 h-4 fill-current" />
                      <span className="font-semibold text-sm">{liveTotalLikes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-400">
                      <ThumbsDown className="w-4 h-4 fill-current" />
                      <span className="font-semibold text-sm">{liveTotalDislikes}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4 mx-auto md:mx-0">
                  <PublisherInfo ownerUid={bot.ownerUid} initialUsername={bot.ownerUsername} initialProfilePicture={bot.ownerProfilePicture} />
                </div>
                
                <a 
                  href={bot.botLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all w-full md:w-auto justify-center"
                >
                  <span>Launch Bot</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mine</span>
                <span className="font-medium text-white">{bot.category || '-'}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mining Type</span>
                <span className="font-medium text-white">{bot.accessType || '-'}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Currency</span>
                <span className="font-medium text-white">{bot.botCurrency || '-'}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</span>
                <span className={`font-medium ${
                  bot.status === 'approved' ? 'text-green-400' :
                  bot.status === 'rejected' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {bot.status === 'approved' ? 'Approved' : bot.status === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                Description
              </h4>
              <p className="text-[#B8C0D0] text-sm leading-relaxed whitespace-pre-wrap">
                {bot.description || 'No description provided.'}
              </p>
            </div>
            

          </div>

          {/* Community Reviews */}
          <div className="w-full flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              Community Reviews
              <span className="bg-white/10 text-white text-xs py-0.5 px-2 rounded-full font-medium">
                {reviews.length}
              </span>
            </h4>
            
            <div className="flex flex-col gap-4">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black/20 border border-white/5 rounded-2xl">
                  <div className="text-4xl mb-4">💬</div>
                  <h5 className="text-white font-medium mb-1">No reviews yet</h5>
                  <p className="text-sm text-[#8F9BB3]">Be the first to share your experience with this bot.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
