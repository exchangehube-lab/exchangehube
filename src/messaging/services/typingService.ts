
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

export const typingService = {
  async updateTypingStatus(userId: string, isTyping: boolean, channelId?: string, conversationId?: string) {
    try {
      const id = channelId ? `channel_${channelId}_${userId}` : `chat_${conversationId}_${userId}`;
      if (isTyping) {
        await setDoc(doc(db, 'typing_status', id), {
          uid: userId,
          is_typing: isTyping,
          channel_id: channelId || null,
          conversation_id: conversationId || null,
          updated_at: new Date().toISOString()
        }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'typing_status', id));
      }
    } catch (e) {
      console.error("Error updating typing status:", e);
    }
  },

  subscribeToChannelTyping(channelId: string, callback: (payload: any) => void) {
    const q = query(collection(db, 'typing_status'), where('channel_id', '==', channelId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const payload = {
          eventType: change.type === 'added' ? 'INSERT' : change.type === 'modified' ? 'UPDATE' : 'DELETE',
          new: change.type !== 'removed' ? change.doc.data() : { is_typing: false, uid: change.doc.id.split('_').pop() },
        };
        callback(payload);
      });
    }, (error) => {
      console.error("Error subscribing to channel typing:", error);
    });
    return { unsubscribe: unsub };
  },

  subscribeToChatTyping(conversationId: string, callback: (payload: any) => void) {
    const q = query(collection(db, 'typing_status'), where('conversation_id', '==', conversationId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const payload = {
          eventType: change.type === 'added' ? 'INSERT' : change.type === 'modified' ? 'UPDATE' : 'DELETE',
          new: change.type !== 'removed' ? change.doc.data() : { is_typing: false, uid: change.doc.id.split('_').pop() },
        };
        callback(payload);
      });
    }, (error) => {
      console.error("Error subscribing to chat typing:", error);
    });
    return { unsubscribe: unsub };
  },

  unsubscribe(subscription: any) {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  }
};
