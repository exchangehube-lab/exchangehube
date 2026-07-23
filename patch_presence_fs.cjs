const fs = require('fs');

const code = `
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, setDoc, doc, getDocs } from 'firebase/firestore';
import { UserPresence } from '../types';

export const presenceService = {
  async updatePresence(userId: string, status: 'online' | 'offline' | 'away', lastSeen?: string) {
    try {
      await setDoc(doc(db, 'user_presence', userId), {
        uid: userId,
        status,
        last_seen: lastSeen || new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error updating presence:", e);
    }
  },

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    const q = query(
      collection(db, 'user_presence'),
      where('uid', '==', userId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as UserPresence;
  },

  subscribeToPresence(userId: string, callback: (presence: UserPresence) => void) {
    const q = query(
      collection(db, 'user_presence'),
      where('uid', '==', userId)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        callback(snapshot.docs[0].data() as UserPresence);
      }
    }, (error) => {
      console.error("Error subscribing to presence:", error);
    });
    return { unsubscribe: unsub };
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
    }, (error) => {
      console.error("Error subscribing to all presence:", error);
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

fs.writeFileSync('src/messaging/services/presenceService.ts', code);
