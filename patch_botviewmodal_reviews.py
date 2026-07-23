import sys
import re

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

# Add doc to imports
content = content.replace(
    "import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';",
    "import { collection, query, onSnapshot, orderBy, doc } from 'firebase/firestore';"
)

review_item_code = """
function ReviewItem({ review }: { review: any }) {
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
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-3">
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

export function BotViewModal"""

content = content.replace("export function BotViewModal", review_item_code)

old_map = """                reviews.map((review) => (
                  <div key={review.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
                        {review.userPhoto ? (
                          <img src={review.userPhoto} alt={review.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-white truncate">{review.username}</span>
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
                ))"""

new_map = """                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))"""

if old_map in content:
    content = content.replace(old_map, new_map)
    with open('src/BotViewModal.tsx', 'w') as f:
        f.write(content)
    print("Patched BotViewModal.tsx")
else:
    print("Could not find exact old_map string")

