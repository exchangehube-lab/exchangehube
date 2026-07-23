import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function PublisherInfo({ ownerUid, initialUsername, initialProfilePicture }: { ownerUid?: string, initialUsername?: string, initialProfilePicture?: string }) {
  const [liveUsername, setLiveUsername] = useState<string>(initialUsername && initialUsername !== 'Unknown' ? initialUsername : 'Anonymous User');
  const [liveUserPhoto, setLiveUserPhoto] = useState<string>(initialProfilePicture || '');

  useEffect(() => {
    if (!ownerUid) return;
    const unsub = onSnapshot(doc(db, 'users', ownerUid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveUsername(data.username || data.fullName || 'Anonymous User');
        setLiveUserPhoto(data.profilePhotoURL || '');
      }
    });
    return () => unsub();
  }, [ownerUid]);

  return (
    <div className="flex items-center gap-[10px] w-full justify-start">
      <div className="w-[40px] h-[40px] rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
        {liveUserPhoto ? (
          <img src={liveUserPhoto} alt={liveUsername} className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-[#B8C0D0]" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[16px] font-bold text-white truncate leading-tight">{liveUsername}</span>
        <span className="text-[12px] text-gray-400 leading-tight">Publisher</span>
      </div>
    </div>
  );
}
