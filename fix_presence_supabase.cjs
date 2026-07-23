const fs = require('fs');

const p = 'src/messaging/services/presenceService.ts';
let content = `import { db } from '../../firebase';
import { collection, query, where, onSnapshot, setDoc, doc, getDocs } from 'firebase/firestore';
import { UserPresence } from '../types';
import { supabase } from '../supabase';

let presenceChannel: any = null;
const presenceCallbacks = new Map<string, Set<(presence: UserPresence) => void>>();
let currentPresenceState: Record<string, any[]> = {};

const getPresenceChannel = () => {
  if (!presenceChannel) {
    presenceChannel = supabase.channel('online-users');
    
    presenceChannel.on('presence', { event: 'sync' }, () => {
      currentPresenceState = presenceChannel.presenceState();
      
      // Notify all subscribers
      for (const [userId, callbacks] of presenceCallbacks.entries()) {
        let isOnline = false;
        let lastSeen = null;
        
        for (const key in currentPresenceState) {
          const presences = currentPresenceState[key] as any[];
          for (const p of presences) {
            if (p.uid === userId && p.is_online) {
              isOnline = true;
              if (p.last_seen) lastSeen = p.last_seen;
            }
          }
        }
        
        // We only notify them if we know they are online, or if they went offline
        callbacks.forEach(cb => {
          // We don't have the full UserPresence here, so we just pass a partial update
          // The caller handles merging with Firestore data
          cb({ uid: userId, is_online: isOnline, last_seen: lastSeen, id: userId } as UserPresence);
        });
      }
    });

    presenceChannel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to presence channel');
      }
    });
  }
  return presenceChannel;
};

export const presenceService = {
  async updatePresence(userId: string, is_online: boolean, lastSeen?: string) {
    try {
      const last_seen = lastSeen || new Date().toISOString();
      
      // Update Firestore
      await setDoc(doc(db, 'user_presence', userId), {
        uid: userId,
        is_online,
        last_seen
      }, { merge: true });

      // Update Supabase Realtime Presence
      const channel = getPresenceChannel();
      if (is_online) {
        await channel.track({
          uid: userId,
          is_online: true,
          last_seen
        });
      } else {
        await channel.untrack();
      }
    } catch (e) {
      console.error("Error updating presence:", e);
    }
  },

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    try {
      const q = query(
        collection(db, 'user_presence'),
        where('uid', '==', userId)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as UserPresence;
    } catch (e) {
      return null;
    }
  },

  subscribeToPresence(userId: string, callback: (presence: UserPresence) => void) {
    // 1. Setup Supabase Presence callback
    let lastKnownFirestoreData: UserPresence | null = null;
    
    if (!presenceCallbacks.has(userId)) {
      presenceCallbacks.set(userId, new Set());
    }
    
    const realtimeCallback = (realtimePresence: UserPresence) => {
      if (!lastKnownFirestoreData) return;
      
      callback({
        ...lastKnownFirestoreData,
        is_online: realtimePresence.is_online,
        last_seen: realtimePresence.last_seen || lastKnownFirestoreData.last_seen
      });
    };
    
    presenceCallbacks.get(userId)!.add(realtimeCallback);
    
    // Make sure channel is initialized
    getPresenceChannel();

    // 2. Subscribe to Firestore to get the initial state and long-term last_seen updates
    const q = query(
      collection(db, 'user_presence'),
      where('uid', '==', userId)
    );
    
    const firestoreUnsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as UserPresence;
        lastKnownFirestoreData = data;
        
        let foundOnline = false;
        for (const key in currentPresenceState) {
          const presences = currentPresenceState[key] as any[];
          for (const p of presences) {
            if (p.uid === userId && p.is_online) {
              foundOnline = true;
            }
          }
        }
        
        callback({
          ...data,
          is_online: foundOnline || data.is_online
        });
      }
    }, (error) => {
      console.error("Error subscribing to presence in Firestore:", error);
    });

    return {
      unsubscribe: () => {
        firestoreUnsub();
        if (presenceCallbacks.has(userId)) {
          presenceCallbacks.get(userId)!.delete(realtimeCallback);
        }
      }
    };
  },

  subscribeToAllPresence(callback: (payload: any) => void) {
    const q = collection(db, 'user_presence');
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const payload = {
          eventType: change.type === 'added' ? 'INSERT' : change.type === 'modified' ? 'UPDATE' : 'DELETE',
          new: change.type !== 'removed' ? change.doc.data() : null,
          old: change.type === 'removed' ? { uid: change.doc.id } : null
        };
        callback(payload);
      });
    });
    return { unsubscribe: unsub };
  },

  unsubscribe(subscription: any) {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  }
};
`;
fs.writeFileSync(p, content);
